import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, CheckCircle, Keyboard, RotateCcw,
    MoreVertical, X, Pencil, Check, Clock
} from 'lucide-react';

// ── SM-2 preview config (mirrors server sm2.js DEFAULT_CONFIG) ─────────────────
const SM2_CFG = {
    learningSteps: [1, 10],
    graduatingInterval: 1,
    easyInterval: 4,
    hardStepFactor: 0.8,
    hardMultiplier: 1.2,
    easyBonus: 1.3,
    defaultEaseFactor: 2.5,
    relearnSteps: [10],
};

// ── FSRS-5 preview helpers (mirrors server sm2.js FSRS functions) ───────────────
const FSRS_W = [0.40255,1.18385,3.17386,15.69105,7.1949,0.5345,1.4604,0.0046,1.54575,0.1192,1.01925,1.9395,0.11,0.29605,2.2698,0.2315,2.9898,0.51655,0.6621];
const FSRS_FACTOR = 19 / 81;
const FSRS_DECAY  = -0.5;
function fsrsR(t, S) { return S > 0 ? Math.pow(1 + FSRS_FACTOR * t / S, FSRS_DECAY) : 0; }
function fsrsInterval(S, r) { return Math.max(1, Math.round((S / FSRS_FACTOR) * (Math.pow(Math.max(0.01, Math.min(0.99, r)), 1 / FSRS_DECAY) - 1))); }
function fsrsInitS(grade) { return Math.max(0.1, FSRS_W[grade - 1]); }
function fsrsStabilityRecall(S, D, R, grade) {
    const hardPenalty = grade === 2 ? FSRS_W[15] : 1;
    const easyBonus   = grade === 4 ? FSRS_W[16] : 1;
    return Math.max(0.1, S * (Math.exp(FSRS_W[8]) * (11 - D) * Math.pow(S, -FSRS_W[9]) * (Math.exp(FSRS_W[10] * (1 - R)) - 1) + 1) * hardPenalty * easyBonus);
}
function qualityToGrade(q) { return ({ 1:1, 3:2, 4:3, 5:4 })[q] ?? 3; }

// ── Interval label for quality buttons ─────────────────────────────────────────
function getIntervalLabel(quality, card, algorithm, desiredRetention) {
    const state = card.state ?? 'new';

    if (algorithm === 'fsrs') {
        const r = desiredRetention ?? 0.9;
        const grade = qualityToGrade(quality);
        if (state === 'new' || state === 'learning') {
            if (grade === 1) return '1m';
            return `${fsrsInterval(fsrsInitS(grade), r)}d`;
        }
        if (state === 'relearning') {
            if (grade === 1) return '10m';
            return `${fsrsInterval(card.stability ?? 1, r)}d`;
        }
        // Review
        if (grade === 1) return '10m';
        const R = fsrsR(card.interval ?? 0, card.stability ?? 1);
        const newS = fsrsStabilityRecall(card.stability ?? 1, card.difficulty ?? 5, R, grade);
        return `${fsrsInterval(newS, r)}d`;
    }

    // SM-2
    const cfg = SM2_CFG;
    const stepIndex = card.stepIndex ?? 0;
    const interval = card.interval ?? 0;
    const easeFactor = card.easeFactor ?? cfg.defaultEaseFactor;

    if (state === 'new' || state === 'learning') {
        const steps = cfg.learningSteps;
        if (quality === 1) return `${steps[0]}m`;
        if (quality === 3) {
            const nextIdx = Math.min(stepIndex + 1, steps.length - 1);
            return `${Math.max(1, Math.round(steps[nextIdx] * cfg.hardStepFactor))}m`;
        }
        if (quality === 4) {
            const nextIdx = stepIndex + 1;
            if (nextIdx >= steps.length) return `${cfg.graduatingInterval}d`;
            return `${steps[nextIdx]}m`;
        }
        if (quality === 5) return `${cfg.easyInterval}d`;
    }
    if (state === 'relearning') {
        const steps = cfg.relearnSteps;
        if (quality === 1) return `${steps[0]}m`;
        if (quality === 3) return `${Math.max(1, Math.round(steps[stepIndex] * cfg.hardStepFactor))}m`;
        if (quality === 4) {
            if (stepIndex + 1 >= steps.length) return `${Math.max(1, interval)}d`;
            return `${steps[stepIndex + 1]}m`;
        }
        if (quality === 5) return `${Math.max(1, interval)}d`;
    }
    // Review phase
    if (quality === 1) return cfg.relearnSteps.length > 0 ? `${cfg.relearnSteps[0]}m` : '1d';
    if (quality === 3) return `${Math.max(1, Math.round(interval * cfg.hardMultiplier))}d`;
    if (quality === 4) return `${Math.max(1, Math.round(interval * easeFactor))}d`;
    if (quality === 5) return `${Math.max(1, Math.round(interval * easeFactor * cfg.easyBonus))}d`;
    return '-';
}

/**
 * Returns in-session delay (ms) or null (day-based / done today).
 * Minute-based → card re-appears in the pending queue.
 * null → card is done for today.
 */
function getSessionDelay(quality, card, algorithm) {
    const state = card.state ?? 'new';

    if (algorithm === 'fsrs') {
        // FSRS: only Again re-queues in-session; everything else is day-based
        if (quality === 1) {
            if (state === 'new' || state === 'learning') return 1 * 60 * 1000;   // 1 min
            return 10 * 60 * 1000;  // 10 min (review/relearning lapse)
        }
        return null;
    }

    // SM-2
    const cfg = SM2_CFG;
    const stepIndex = card.stepIndex ?? 0;

    if (quality === 1) return 60 * 1000; // Again always 1 minute

    if (state === 'new' || state === 'learning') {
        const steps = cfg.learningSteps;
        if (quality === 3) {
            const nextIdx = Math.min(stepIndex + 1, steps.length - 1);
            return Math.max(1, Math.round(steps[nextIdx] * cfg.hardStepFactor)) * 60 * 1000;
        }
        if (quality === 4) {
            const nextIdx = stepIndex + 1;
            if (nextIdx < steps.length) return steps[nextIdx] * 60 * 1000;
            return null; // graduated
        }
        return null; // Easy — graduated
    }
    if (state === 'relearning') {
        const steps = cfg.relearnSteps;
        if (quality === 3) {
            return Math.max(1, Math.round(steps[stepIndex] * cfg.hardStepFactor)) * 60 * 1000;
        }
        if (quality === 4) {
            const nextIdx = stepIndex + 1;
            if (nextIdx < steps.length) return steps[nextIdx] * 60 * 1000;
            return null;
        }
        return null;
    }
    return null; // Review phase: all day-based
}

// Background uses /75 opacity → color visible but soft; text stays full white (opacity unaffected)
const qualityOptions = [
    { key: 'again', value: 1, color: 'bg-red-500/75 hover:bg-red-500/95' },
    { key: 'hard',  value: 3, color: 'bg-yellow-400/75 hover:bg-yellow-400/95' },
    { key: 'good',  value: 4, color: 'bg-green-500/75 hover:bg-green-500/95' },
    { key: 'easy',  value: 5, color: 'bg-blue-500/75 hover:bg-blue-500/95' },
];

export default function ReviewMode({ cards, onReview, onBack, onEditCard, algorithm = 'sm2', desiredRetention = 0.9 }) {
    const { t } = useTranslation();

    // Main session card list (grows as pending cards are re-inserted)
    const [sessionCards, setSessionCards] = useState([...cards]);
    // Cards rated Again — waiting to re-appear after their delay: [{ card, dueAt }]
    const [pendingCards, setPendingCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // phase: 'reviewing' → normal review | 'waiting' → pending cards not yet due | 'done' → all finished
    const [phase, setPhase] = useState('reviewing');
    const [waitSeconds, setWaitSeconds] = useState(0);

    const [revealed, setRevealed] = useState(false);
    const [writeMode, setWriteMode] = useState(false);
    const [writtenAnswer, setWrittenAnswer] = useState('');
    const [reviewedCount, setReviewedCount] = useState(0);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editFront, setEditFront] = useState('');
    const [editBack, setEditBack] = useState('');
    const [showCardMenu, setShowCardMenu] = useState(false);

    const cardMenuRef = useRef(null);
    const currentCard = sessionCards[currentIndex];

    // ── Countdown timer while waiting for learning-phase cards to become due ──
    useEffect(() => {
        if (phase !== 'waiting') return;
        if (pendingCards.length === 0) { setPhase('done'); return; }

        const tick = () => {
            const now = Date.now();
            const due = pendingCards.filter(p => p.dueAt <= now);

            if (due.length > 0) {
                // Cards are now due — re-insert them and resume
                setSessionCards(prev => [...prev, ...due.map(p => p.card)]);
                setPendingCards(prev => prev.filter(p => p.dueAt > now));
                setRevealed(false);
                setWrittenAnswer('');
                setPhase('reviewing');
            } else {
                const earliest = Math.min(...pendingCards.map(p => p.dueAt));
                setWaitSeconds(Math.max(0, Math.ceil((earliest - now) / 1000)));
            }
        };

        tick(); // check immediately on entering waiting phase
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [phase, pendingCards]);

    // ── Advance to next card, absorbing any newly-due pending cards ───────────
    const moveToNext = (latestSession, latestPending, fromIndex) => {
        const now = Date.now();
        const due = latestPending.filter(p => p.dueAt <= now);

        let updatedSession = latestSession;
        let updatedPending = latestPending;

        if (due.length > 0) {
            updatedSession = [...latestSession, ...due.map(p => p.card)];
            updatedPending = latestPending.filter(p => p.dueAt > now);
            setSessionCards(updatedSession);
            setPendingCards(updatedPending);
        }

        const nextIndex = fromIndex + 1;

        if (nextIndex < updatedSession.length) {
            setCurrentIndex(nextIndex);
            setRevealed(false);
        } else if (updatedPending.length > 0) {
            // Main queue done — wait for pending cards
            setCurrentIndex(nextIndex); // advance past the end so currentCard is correct when cards arrive
            const earliest = Math.min(...updatedPending.map(p => p.dueAt));
            setWaitSeconds(Math.max(0, Math.ceil((earliest - now) / 1000)));
            setPhase('waiting');
        } else {
            setPhase('done');
        }
    };

    // ── Rating a card ─────────────────────────────────────────────────────────
    const handleRate = async (quality) => {
        await onReview(currentCard.id, quality);
        setWrittenAnswer('');

        const delayMs = getSessionDelay(quality, currentCard, algorithm);

        if (delayMs !== null) {
            // Minute-based result: card returns within this session after the delay
            const dueAt = Date.now() + delayMs;
            const newPending = [...pendingCards, { card: currentCard, dueAt }];
            setPendingCards(newPending);
            moveToNext(sessionCards, newPending, currentIndex);
        } else {
            // Day-based result: card is done for today
            setReviewedCount(prev => prev + 1);
            moveToNext(sessionCards, pendingCards, currentIndex);
        }
    };

    const handleUndo = () => {
        if (currentIndex === 0) return;
        setCurrentIndex(prev => prev - 1);
        setRevealed(false);
        setWrittenAnswer('');
    };

    const toggleWriteMode = () => {
        setWriteMode(v => !v);
        setWrittenAnswer('');
    };

    const openEditModal = () => {
        setEditFront(currentCard.front);
        setEditBack(currentCard.back);
        setShowCardMenu(false);
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!editFront.trim() || !editBack.trim()) return;
        onEditCard(currentCard.id, { front: editFront.trim(), back: editBack.trim() });
        setShowEditModal(false);
    };

    // ── Waiting screen ────────────────────────────────────────────────────────
    if (phase === 'waiting') {
        return (
            <div className="max-w-xl mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
                    <Clock size={32} className="text-blue-500 animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    {pendingCards.length} card{pendingCards.length !== 1 ? 's' : ''} coming back...
                </h2>
                <p className="text-4xl font-mono font-bold text-blue-500 mb-2">{waitSeconds}s</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                    Cards rated Again will reappear automatically
                </p>
                <button
                    onClick={onBack}
                    className="px-5 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    End Session
                </button>
            </div>
        );
    }

    // ── Done screen ───────────────────────────────────────────────────────────
    if (phase === 'done') {
        return (
            <div className="max-w-xl mx-auto text-center py-12">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {t('flashcards.reviewComplete')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t('flashcards.cardsReviewed', { count: reviewedCount })}
                </p>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    {t('flashcards.backToDecks')}
                </button>
            </div>
        );
    }

    // ── Main review UI ────────────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 gap-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
                >
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">{t('flashcards.backToDecks')}</span>
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {t('flashcards.cardOf', { current: currentIndex + 1, total: sessionCards.length })}
                    {pendingCards.length > 0 && (
                        <span className="ml-2 text-xs text-red-400">+{pendingCards.length} again</span>
                    )}
                </p>
                <div className="w-8 sm:w-28 shrink-0" />
            </div>

            {/* Card */}
            <div className="relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[44vh] sm:min-h-[58vh]">
                {/* 3-dots on card */}
                <div className="absolute top-3 right-3" ref={cardMenuRef}>
                    <button
                        onClick={() => setShowCardMenu(v => !v)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {showCardMenu && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-10 min-w-32">
                            <button
                                onClick={openEditModal}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                                <Pencil size={14} />
                                {t('flashcards.editCard')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Card content — grows to fill space */}
                <div className="flex-1 p-7 pr-10">
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                        {currentCard.front}
                    </p>

                    {revealed && (
                        <>
                            <hr className="my-5 border-gray-200 dark:border-gray-700" />
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {currentCard.back}
                            </p>
                        </>
                    )}
                </div>

                {/* Write mode input — pinned to bottom of card, only when not revealed */}
                {writeMode && !revealed && (
                    <div className="px-7 pb-5">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={writtenAnswer}
                                onChange={(e) => setWrittenAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && setRevealed(true)}
                                placeholder={t('flashcards.writeAnswer')}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <button
                                onClick={() => setRevealed(true)}
                                className="shrink-0 w-10 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Check size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom controls */}
            {revealed ? (
                /* After reveal: only quality buttons */
                <div className="mt-4 flex gap-2">
                    {qualityOptions.map(({ key, value, color }) => (
                        <button
                            key={key}
                            onClick={() => handleRate(value)}
                            className={`flex flex-col items-center px-2 py-3 text-white rounded-xl font-medium transition-colors ${color} flex-1`}
                        >
                            <span className="text-sm">{t(`flashcards.${key}`)}</span>
                            <span className="text-xs opacity-75 mt-0.5">
                                {getIntervalLabel(value, currentCard, algorithm, desiredRetention)}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                /* Before reveal: keyboard — tap to show — undo */
                <div className="mt-4 flex items-center gap-3">
                    <button
                        onClick={toggleWriteMode}
                        className={`p-3 rounded-full border-2 transition-colors shrink-0 ${
                            writeMode
                                ? 'bg-gray-800 border-gray-800 text-white dark:bg-gray-200 dark:border-gray-200 dark:text-gray-900'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title={t('flashcards.writeAnswer')}
                    >
                        {writeMode ? <X size={20} /> : <Keyboard size={20} />}
                    </button>

                    <div className="flex-1 flex justify-center">
                        <button
                            onClick={() => setRevealed(true)}
                            className="px-8 py-4 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors text-sm"
                        >
                            {t('flashcards.tapToReveal')}
                        </button>
                    </div>

                    <button
                        onClick={handleUndo}
                        disabled={currentIndex === 0}
                        className="p-3 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                        title={t('flashcards.undo')}
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            )}

            {/* Edit card modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                {t('flashcards.editCard')}
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <textarea
                            value={editFront}
                            onChange={(e) => setEditFront(e.target.value)}
                            placeholder={t('flashcards.front')}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        />
                        <textarea
                            value={editBack}
                            onChange={(e) => setEditBack(e.target.value)}
                            placeholder={t('flashcards.back')}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                            >
                                {t('flashcards.save')}
                            </button>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                            >
                                {t('flashcards.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
