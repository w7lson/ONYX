import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';

export default function AddCards({ deck, onAddCard, onBack }) {
    const { t } = useTranslation();
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [adding, setAdding] = useState(false);
    const [addedCount, setAddedCount] = useState(0);
    const [flash, setFlash] = useState(false);
    const frontRef = useRef(null);

    useEffect(() => {
        frontRef.current?.focus();
    }, []);

    const handleAdd = async () => {
        if (!front.trim() || !back.trim() || adding) return;
        setAdding(true);
        try {
            await onAddCard({ front: front.trim(), back: back.trim() });
            setAddedCount(prev => prev + 1);
            setFront('');
            setBack('');
            setFlash(true);
            setTimeout(() => setFlash(false), 1200);
            frontRef.current?.focus();
        } catch (e) {
            console.error('Failed to add card:', e);
        } finally {
            setAdding(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleAdd();
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('flashcards.backToDecks')}
            </button>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">{t('flashcards.addCards', { defaultValue: 'Add Cards' })}</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{deck.title}</p>
                </div>
                {addedCount > 0 && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${flash ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.06] text-slate-400'}`}>
                        <CheckCircle2 size={14} />
                        <span className="text-sm font-medium">{addedCount} added</span>
                    </div>
                )}
            </div>

            <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('flashcards.front')}
                    </label>
                    <textarea
                        ref={frontRef}
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('flashcards.frontPlaceholder', { defaultValue: 'Term, question, or concept...' })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('flashcards.back')}
                    </label>
                    <textarea
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('flashcards.backPlaceholder', { defaultValue: 'Definition, answer, or translation...' })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                </div>
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-500">
                        {t('flashcards.addCardHint', { defaultValue: 'Tip: ⌘+Enter or Ctrl+Enter to add quickly' })}
                    </p>
                    <button
                        onClick={handleAdd}
                        disabled={!front.trim() || !back.trim() || adding}
                        className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        {adding ? t('flashcards.adding', { defaultValue: 'Adding...' }) : t('flashcards.addCard', { defaultValue: 'Add Card' })}
                    </button>
                </div>
            </div>
        </div>
    );
}
