import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronRight, SlidersHorizontal, Pencil, FolderOpen,
    Copy, RotateCcw, Archive, Download, Trash2,
    Check, X, CheckCircle2
} from 'lucide-react';

function ToggleSwitch({ enabled, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary-600' : 'bg-white/[0.12]'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
}

// ── Algorithm selection cards ──────────────────────────────────────────────────

const ALGORITHMS = [
    {
        id: 'sm2',
        name: 'SM-2',
        subtitle: 'Classic Algorithm',
        tagline: 'Proven over decades of use',
        features: [
            'Fixed learning steps (1m → 10m)',
            'Ease factor adapts to recall quality',
            'Familiar 4-button rating system',
            'Simple and predictable scheduling',
        ],
        gradient: 'from-blue-500/10 to-cyan-500/5',
        border: 'border-blue-800/50',
        selectedBorder: 'ring-2 ring-blue-500',
        selectedBg: 'bg-blue-950/40',
        checkColor: 'text-blue-500',
        tagBg: 'bg-blue-900/50 text-blue-300',
        dotColor: 'bg-blue-400',
    },
    {
        id: 'fsrs',
        name: 'FSRS-5',
        subtitle: 'Modern Memory Science',
        tagline: 'Fewer reviews, better retention',
        features: [
            'Three-component memory model (D/S/R)',
            'Power-law forgetting curve',
            'Customizable retention target',
            'Optimised for long-term memory',
        ],
        gradient: 'from-violet-500/10 to-purple-500/5',
        border: 'border-violet-800/50',
        selectedBorder: 'ring-2 ring-violet-500',
        selectedBg: 'bg-violet-950/40',
        checkColor: 'text-violet-500',
        tagBg: 'bg-violet-900/50 text-violet-300',
        dotColor: 'bg-violet-400',
    },
];

function AlgorithmCard({ algo, selected, onSelect }) {
    return (
        <button
            onClick={() => onSelect(algo.id)}
            className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 relative overflow-hidden
                ${algo.border}
                ${selected ? `${algo.selectedBorder} ${algo.selectedBg} shadow-md` : 'bg-[#111318] hover:bg-[#161A22]'}`}
        >
            {/* Gradient wash */}
            <div className={`absolute inset-0 bg-gradient-to-br ${algo.gradient} pointer-events-none`} />

            <div className="relative">
                {/* Header row */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${algo.tagBg}`}>
                            {algo.subtitle}
                        </span>
                        <h3 className="text-xl font-bold text-slate-100 leading-none">
                            {algo.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{algo.tagline}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 mt-0.5 transition-all
                        ${selected
                            ? `border-current bg-current ${algo.checkColor}`
                            : 'border-white/[0.20]'}`}
                    >
                        {selected && <Check size={12} className="text-white" />}
                    </div>
                </div>

                {/* Feature list */}
                <ul className="space-y-1 mt-3">
                    {algo.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${algo.dotColor}`} />
                            {f}
                        </li>
                    ))}
                </ul>
            </div>
        </button>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DeckSettings({
    deck,
    onBack,
    onRename,
    onDuplicate,
    onResetProgress,
    onArchive,
    onExport,
    onDelete,
    onSaveAlgorithmSettings,
}) {
    const { t } = useTranslation();
    const [subView, setSubView] = useState(null); // null | 'algorithm' | 'rename'
    const [pendingConfirm, setPendingConfirm] = useState(null); // { action, message }

    // Algorithm settings local state
    const [algorithm, setAlgorithm] = useState(deck.algorithm ?? 'sm2');
    const [desiredRetention, setDesiredRetention] = useState(deck.desiredRetention ?? 0.9);
    const [newCardsPerDay, setNewCardsPerDay] = useState(deck.newCardsPerDay ?? 20);
    const [maxCardsPerDay, setMaxCardsPerDay] = useState(deck.maxCardsPerDay ?? 100);
    const [shuffleCards, setShuffleCards] = useState(deck.shuffleCards ?? false);

    // Rename local state
    const [renameValue, setRenameValue] = useState(deck.title);
    const [moveSoonVisible, setMoveSoonVisible] = useState(false);

    const handleSaveAlgorithm = () => {
        onSaveAlgorithmSettings({ algorithm, desiredRetention, newCardsPerDay, maxCardsPerDay, shuffleCards });
        setSubView(null);
    };

    const handleRename = () => {
        if (!renameValue.trim()) return;
        onRename(renameValue.trim());
        setSubView(null);
    };

    // Breadcrumb
    const renderBreadcrumb = () => {
        const crumbs = [
            { label: t('nav.flashcards') || 'Flashcards', onClick: onBack },
            { label: deck.title, onClick: subView ? () => setSubView(null) : null },
        ];
        if (subView === 'algorithm') {
            crumbs.push({ label: t('flashcards.algorithmSettings'), onClick: null });
        }

        return (
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-6 flex-wrap">
                {crumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight size={14} className="text-slate-600" />}
                        {crumb.onClick ? (
                            <button onClick={crumb.onClick} className="hover:text-primary-400 transition-colors">
                                {crumb.label}
                            </button>
                        ) : (
                            <span className="text-slate-300 font-medium">{crumb.label}</span>
                        )}
                    </span>
                ))}
                {!subView && (
                    <>
                        <ChevronRight size={14} className="text-slate-600" />
                        <span className="text-slate-300 font-medium">{t('flashcards.settings')}</span>
                    </>
                )}
            </div>
        );
    };

    // ── Algorithm Settings sub-view ────────────────────────────────────────────
    if (subView === 'algorithm') {
        const retentionPct = Math.round(desiredRetention * 100);

        return (
            <div>
                {renderBreadcrumb()}
                <h2 className="text-xl font-bold text-slate-100 mb-1">
                    {t('flashcards.algorithmSettings')}
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                    Choose how your cards are scheduled for review
                </p>

                {/* Algorithm selection cards */}
                <div className="space-y-3 mb-6">
                    {ALGORITHMS.map(algo => (
                        <AlgorithmCard
                            key={algo.id}
                            algo={algo}
                            selected={algorithm === algo.id}
                            onSelect={setAlgorithm}
                        />
                    ))}
                </div>

                {/* FSRS: desired retention slider */}
                {algorithm === 'fsrs' && (
                    <div className="bg-[#161A22] rounded-xl border border-violet-800/40 p-4 mb-5">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-slate-100">
                                {t('flashcards.desiredRetention')}
                            </p>
                            <span className="text-lg font-bold text-violet-400 tabular-nums">
                                {retentionPct}%
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                            Target recall rate when a card comes up for review
                        </p>
                        <input
                            type="range"
                            min={70}
                            max={99}
                            step={1}
                            value={retentionPct}
                            onChange={(e) => setDesiredRetention(Number(e.target.value) / 100)}
                            className="w-full accent-violet-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>70% (fewer reviews)</span>
                            <span>99% (more reviews)</span>
                        </div>
                    </div>
                )}

                {/* Daily limits */}
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                    Daily Limits
                </p>
                <div className="bg-[#161A22] rounded-xl border border-white/[0.06] divide-y divide-white/[0.06] mb-4">
                    <div className="p-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-200">
                            {t('flashcards.newCardsPerDay')}
                        </p>
                        <input
                            type="number"
                            value={newCardsPerDay}
                            onChange={(e) => setNewCardsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            className="w-20 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-100 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-200">
                            {t('flashcards.maxCardsPerDay')}
                        </p>
                        <input
                            type="number"
                            value={maxCardsPerDay}
                            onChange={(e) => setMaxCardsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            className="w-20 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-100 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-200">
                            {t('flashcards.shuffleCards')}
                        </p>
                        <ToggleSwitch enabled={shuffleCards} onToggle={() => setShuffleCards(v => !v)} />
                    </div>
                </div>

                <button
                    onClick={handleSaveAlgorithm}
                    className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                    {t('flashcards.save')}
                </button>
            </div>
        );
    }

    // ── Main settings list ─────────────────────────────────────────────────────
    const selectedAlgo = ALGORITHMS.find(a => a.id === (deck.algorithm ?? 'sm2'));

    const settingRows = [
        {
            icon: <SlidersHorizontal size={18} />,
            label: t('flashcards.algorithmSettings'),
            onClick: () => setSubView('algorithm'),
            arrow: true,
            detail: (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedAlgo?.tagBg}`}>
                    {selectedAlgo?.name}
                </span>
            ),
        },
        {
            icon: <Pencil size={18} />,
            label: t('flashcards.renameDeck'),
            onClick: () => setSubView('rename'),
            arrow: true,
        },
        {
            icon: <FolderOpen size={18} />,
            label: t('flashcards.moveDeck'),
            onClick: () => setMoveSoonVisible(true),
            arrow: false,
            badge: moveSoonVisible ? (
                <span className="text-xs bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full">
                    {t('flashcards.moveDeckSoon')}
                </span>
            ) : null,
        },
        {
            icon: <Copy size={18} />,
            label: t('flashcards.duplicateDeck'),
            onClick: () => setPendingConfirm({ action: onDuplicate, message: `Duplicate "${deck.title}"?` }),
            arrow: false,
        },
    ];

    const destructiveRows = [
        {
            icon: <RotateCcw size={18} />,
            label: t('flashcards.resetProgress'),
            onClick: () => setPendingConfirm({ action: onResetProgress, message: 'Reset all card progress? This cannot be undone.' }),
            danger: false,
        },
        {
            icon: <Archive size={18} />,
            label: t('flashcards.archiveDeck'),
            onClick: onArchive,
            danger: false,
        },
        {
            icon: <Download size={18} />,
            label: t('flashcards.exportDeck'),
            onClick: onExport,
            danger: false,
        },
        {
            icon: <Trash2 size={18} />,
            label: t('flashcards.deleteDeck'),
            onClick: () => setPendingConfirm({ action: onDelete, message: `Delete "${deck.title}"? This cannot be undone.` }),
            danger: true,
        },
    ];

    return (
        <div>
            {renderBreadcrumb()}
            <h2 className="text-xl font-bold text-slate-100 mb-6">
                {t('flashcards.settings')}
            </h2>

            {/* Rename inline form */}
            {subView === 'rename' && (
                <div className="bg-[#161A22] rounded-xl border border-primary-700/50 p-4 mb-4">
                    <p className="text-sm font-medium text-slate-400 mb-2">
                        {t('flashcards.renameDeck')}
                    </p>
                    <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleRename}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                            <Check size={14} />
                            {t('flashcards.save')}
                        </button>
                        <button
                            onClick={() => { setSubView(null); setRenameValue(deck.title); }}
                            className="px-3 py-1.5 bg-white/[0.06] text-slate-300 rounded-lg text-sm font-medium hover:bg-white/[0.10] transition-colors"
                        >
                            {t('flashcards.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {/* Main settings rows */}
            <div className="bg-[#161A22] rounded-xl border border-white/[0.06] divide-y divide-white/[0.06] mb-3 overflow-hidden">
                {settingRows.map((row, i) => (
                    <button
                        key={i}
                        onClick={row.onClick}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
                    >
                        <div className="flex items-center gap-3 text-slate-200">
                            <span className="text-slate-400">{row.icon}</span>
                            <span className="text-sm font-medium">{row.label}</span>
                            {row.badge}
                        </div>
                        <div className="flex items-center gap-2">
                            {row.detail}
                            {row.arrow && <ChevronRight size={16} className="text-slate-500" />}
                        </div>
                    </button>
                ))}
            </div>

            {/* Destructive rows */}
            <div className="bg-[#161A22] rounded-xl border border-white/[0.06] divide-y divide-white/[0.06] overflow-hidden">
                {destructiveRows.map((row, i) => (
                    <button
                        key={i}
                        onClick={row.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left ${row.danger ? 'text-red-400' : 'text-slate-200'}`}
                    >
                        <span className={row.danger ? 'text-red-400' : 'text-slate-400'}>
                            {row.icon}
                        </span>
                        <span className="text-sm font-medium">{row.label}</span>
                    </button>
                ))}
            </div>

            {/* Inline confirmation dialog */}
            {pendingConfirm && (
                <div className="mt-3 bg-amber-950/30 border border-amber-800/50 rounded-xl p-4">
                    <p className="text-sm text-amber-200 mb-3">{pendingConfirm.message}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { pendingConfirm.action(); setPendingConfirm(null); }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setPendingConfirm(null)}
                            className="px-3 py-1.5 bg-white/[0.06] text-slate-300 rounded-lg text-sm font-medium hover:bg-white/[0.10] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
