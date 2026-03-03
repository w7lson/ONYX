import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Trash2, Pencil, Check, X,
    MoreVertical, BookOpen, TrendingUp, Star,
    Clock, Calendar, Plus, Sparkles, Upload
} from 'lucide-react';
import ImportCSV from './ImportCSV';

function getCardLabel(card) {
    if ((card.state ?? 'new') === 'new') return null;
    const now = new Date();
    const nextReview = new Date(card.nextReviewAt);
    const daysUntil = Math.ceil((nextReview - now) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) return { text: 'Today', color: 'text-green-500', icon: 'clock' };
    if (daysUntil === 1) return { text: 'Tomorrow', color: 'text-blue-500', icon: 'calendar' };
    return { text: `In ${daysUntil} days`, color: 'text-blue-500', icon: 'calendar' };
}

export default function DeckDetail({
    deck,
    cards,
    dueCards,
    decks,
    cardsLoading,
    onBack,
    onDeleteCard,
    onEditCard,
    onEditDeck,
    onStudy,
    onOpenSettings,
    onAddCards,
    onGenerateAI,
    onImport,
}) {
    const { t } = useTranslation();

    // Card editing
    const [editingCardId, setEditingCardId] = useState(null);
    const [editFront, setEditFront] = useState('');
    const [editBack, setEditBack] = useState('');

    // Card delete confirmation
    const [confirmDeleteCardId, setConfirmDeleteCardId] = useState(null);

    // Inline CSV import (empty-state only)
    const [showImport, setShowImport] = useState(false);

    // Card status counts derived from state field
    const notStudied = cards.filter(c => (c.state ?? 'new') === 'new').length;
    const learning = cards.filter(c => c.state === 'learning' || c.state === 'relearning').length;
    const mastered = cards.filter(c => c.state === 'review').length;

    const startEditCard = (card) => {
        setEditingCardId(card.id);
        setEditFront(card.front);
        setEditBack(card.back);
    };

    const handleSaveCard = () => {
        if (!editFront.trim() || !editBack.trim()) return;
        onEditCard(editingCardId, { front: editFront.trim(), back: editBack.trim() });
        setEditingCardId(null);
    };

    const handleCancelCardEdit = () => {
        setEditingCardId(null);
        setEditFront('');
        setEditBack('');
    };

    const isEmpty = cards.length === 0;

    return (
        <div className={!isEmpty && !cardsLoading ? 'pb-24' : ''}>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('flashcards.backToDecks')}
            </button>

            {/* Title row with 3-dots */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{deck.title}</h1>
                    {deck.description && (
                        <p className="text-slate-400 mt-1">{deck.description}</p>
                    )}
                </div>
                <button
                    onClick={onOpenSettings}
                    className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-md transition-colors mt-1 shrink-0"
                    title={t('flashcards.settings')}
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {cardsLoading ? (
                /* ── Loading ── */
                <div className="flex items-center justify-center py-20">
                    <div className="w-7 h-7 rounded-full border-2 border-white/[0.08] border-t-primary-500 animate-spin" />
                </div>
            ) : isEmpty ? (
                /* ── Empty deck: 3 centered action buttons ── */
                <div className="flex flex-col items-center gap-4 py-16">
                    <p className="text-slate-400 text-center mb-2">
                        {t('flashcards.deckEmpty', { defaultValue: 'This deck is empty. Add cards to start studying.' })}
                    </p>

                    <button
                        onClick={onAddCards}
                        className="flex items-center justify-center gap-3 w-64 py-3.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                        <Plus size={18} />
                        {t('flashcards.addCards', { defaultValue: 'Add Cards' })}
                    </button>

                    <button
                        onClick={onGenerateAI}
                        className="flex items-center justify-center gap-3 w-64 py-3.5 bg-white/[0.06] text-slate-200 rounded-lg font-semibold hover:bg-white/[0.10] transition-colors border border-white/[0.08]"
                    >
                        <Sparkles size={18} />
                        {t('flashcards.generateWithAI', { defaultValue: 'Generate with AI' })}
                    </button>

                    <button
                        onClick={() => setShowImport(prev => !prev)}
                        className="flex items-center justify-center gap-3 w-64 py-3.5 bg-white/[0.06] text-slate-200 rounded-lg font-semibold hover:bg-white/[0.10] transition-colors border border-white/[0.08]"
                    >
                        <Upload size={18} />
                        {t('flashcards.import.button', { defaultValue: 'Import from CSV' })}
                    </button>

                    {showImport && (
                        <div className="w-full max-w-lg mt-2">
                            <ImportCSV
                                decks={decks}
                                onImport={async (data) => {
                                    await onImport(data);
                                    setShowImport(false);
                                }}
                                onClose={() => setShowImport(false)}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Stats card */}
                    <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-6 mb-6 text-center">
                        {/* Due count */}
                        <div className="mb-1">
                            <span className="text-7xl font-bold text-slate-100">
                                {dueCards}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-6">
                            {dueCards === 0 ? t('flashcards.noCardsDue') : t('flashcards.todayDue')}
                        </p>

                        {/* Stats row: icon + number stacked, label below */}
                        <div className="flex items-start justify-center gap-10 mb-6">
                            <div className="flex flex-col items-center gap-1">
                                <BookOpen size={22} className="text-slate-500" />
                                <span className="text-xl font-bold text-slate-400">{notStudied}</span>
                                <span className="text-xs text-slate-500">{t('flashcards.notStudied')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <TrendingUp size={22} className="text-green-500" />
                                <span className="text-xl font-bold text-green-400">{learning}</span>
                                <span className="text-xs text-slate-500">{t('flashcards.learning')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Star size={22} className="text-blue-400" />
                                <span className="text-xl font-bold text-blue-400">{mastered}</span>
                                <span className="text-xs text-slate-500">{t('flashcards.mastered')}</span>
                            </div>
                        </div>

                        <button
                            onClick={onStudy}
                            disabled={dueCards === 0}
                            className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {t('flashcards.studyCards')}
                        </button>
                    </div>

                    {/* Card list */}
                    <div className="space-y-3">
                        {cards.map((card) => {
                            const label = getCardLabel(card);
                            return (
                                <div
                                    key={card.id}
                                    className="bg-[#161A22] rounded-lg border border-white/[0.06] p-4"
                                >
                                    {editingCardId === card.id ? (
                                        <div>
                                            <textarea
                                                value={editFront}
                                                onChange={(e) => setEditFront(e.target.value)}
                                                placeholder={t('flashcards.front')}
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-md border border-primary-500/40 bg-white/[0.05] text-slate-100 mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                                            />
                                            <textarea
                                                value={editBack}
                                                onChange={(e) => setEditBack(e.target.value)}
                                                placeholder={t('flashcards.back')}
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveCard}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                                                >
                                                    <Check size={14} />
                                                    {t('flashcards.save')}
                                                </button>
                                                <button
                                                    onClick={handleCancelCardEdit}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] text-slate-300 rounded-md text-sm font-medium hover:bg-white/[0.10] transition-colors"
                                                >
                                                    {t('flashcards.cancel')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {label && (
                                                    <div className={`flex items-center gap-1 mb-1.5 ${label.color}`}>
                                                        {label.icon === 'clock'
                                                            ? <Clock size={12} />
                                                            : <Calendar size={12} />
                                                        }
                                                        <span className="text-xs font-medium">{label.text}</span>
                                                    </div>
                                                )}
                                                <p className="font-medium text-slate-100">{card.front}</p>
                                                <p className="text-sm text-slate-400 mt-1">{card.back}</p>
                                            </div>
                                            {confirmDeleteCardId === card.id ? (
                                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                                <span className="text-xs text-slate-400">Delete?</span>
                                                <button
                                                    onClick={() => { onDeleteCard(card.id); setConfirmDeleteCardId(null); }}
                                                    className="px-2.5 py-1 text-xs bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteCardId(null)}
                                                    className="px-2.5 py-1 text-xs bg-white/[0.06] text-slate-300 rounded-md font-medium hover:bg-white/[0.10] transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 shrink-0 ml-3">
                                                <button
                                                    onClick={() => startEditCard(card)}
                                                    className="p-1.5 text-slate-500 hover:text-primary-400 transition-colors"
                                                    title={t('flashcards.editCard')}
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteCardId(card.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Fixed Add Cards button — only when deck has cards and not loading */}
            {!isEmpty && !cardsLoading && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <button
                        onClick={onAddCards}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-semibold shadow-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus size={18} />
                        {t('flashcards.addCards', { defaultValue: 'Add Cards' })}
                    </button>
                </div>
            )}
        </div>
    );
}
