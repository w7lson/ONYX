import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, Zap } from 'lucide-react';

const MAX_GENERATIONS = 3;

export default function GenerateAI({ deck, onGenerate, onBack }) {
    const { t } = useTranslation();
    const [topic, setTopic] = useState('');
    const [format, setFormat] = useState('definition');
    const [countStr, setCountStr] = useState('10');
    const [generating, setGenerating] = useState(false);
    const [generatedCount, setGeneratedCount] = useState(0);

    const storageKey = `flashcard_gen_${deck.id}`;
    const [generationsUsed, setGenerationsUsed] = useState(() => {
        return parseInt(localStorage.getItem(storageKey) || '0', 10);
    });

    const generationsLeft = Math.max(0, MAX_GENERATIONS - generationsUsed);

    const handleGenerate = async () => {
        if (!topic.trim() || generationsLeft <= 0 || generating) return;
        const validCount = Math.max(1, Math.min(50, parseInt(countStr) || 10));
        setGenerating(true);
        try {
            await onGenerate({ topic: topic.trim(), count: validCount, format });
            const newUsed = generationsUsed + 1;
            localStorage.setItem(storageKey, String(newUsed));
            setGenerationsUsed(newUsed);
            setGeneratedCount(validCount);
        } catch (e) {
            console.error('Failed to generate:', e);
        } finally {
            setGenerating(false);
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

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-100">
                    {t('flashcards.generateWithAI', { defaultValue: 'Generate Cards with AI' })}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">{deck.title}</p>
            </div>

            <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-6 space-y-5">
                {/* Topic textarea */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('flashcards.topicPrompt', { defaultValue: 'Topic / Prompt' })}
                    </label>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t('flashcards.topicPlaceholder', { defaultValue: "Describe what you want to study. E.g. 'Spanish vocabulary for travel', 'React hooks concepts', 'French Revolution key events'..." })}
                        rows={4}
                        className="w-full px-4 py-3 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                </div>

                {/* Card format + Amount in one row */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                            {t('flashcards.cardFormat', { defaultValue: 'Card Format' })}
                        </label>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-white/[0.08] bg-[#1e2330] text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        >
                            <option value="definition">{t('flashcards.formatDefinition', { defaultValue: 'Definition / Meaning' })}</option>
                            <option value="translation">{t('flashcards.formatTranslation', { defaultValue: 'Word / Translation' })}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                            {t('flashcards.cardsAmount', { defaultValue: 'Amount' })}
                        </label>
                        <input
                            type="number"
                            value={countStr}
                            onChange={(e) => setCountStr(e.target.value)}
                            min={1}
                            max={50}
                            className="w-24 px-3 py-2 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Footer: generations left + generate button */}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                        <Zap size={14} className={generationsLeft > 0 ? 'text-yellow-400' : 'text-slate-500'} />
                        <span className={`text-sm ${generationsLeft > 0 ? 'text-slate-300' : 'text-slate-500'}`}>
                            {t('flashcards.generationsLeft', { defaultValue: 'Free generations left:' })}{' '}
                            <span className={`font-semibold ${generationsLeft > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {generationsLeft}
                            </span>
                        </span>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!topic.trim() || generationsLeft <= 0 || generating}
                        className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={16} />
                        {generating
                            ? t('flashcards.generating', { defaultValue: 'Generating...' })
                            : t('flashcards.generate', { defaultValue: 'Generate' })}
                    </button>
                </div>

                {/* Success message */}
                {generatedCount > 0 && !generating && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 text-sm text-green-400">
                        {t('flashcards.generateSuccess', { count: generatedCount, defaultValue: `${generatedCount} cards generated successfully! Go back to view them.` })}
                    </div>
                )}

                {/* Limit reached */}
                {generationsLeft === 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-sm text-red-400">
                        {t('flashcards.generateLimitReached', { defaultValue: "You've used all free generations for this deck." })}
                    </div>
                )}
            </div>
        </div>
    );
}
