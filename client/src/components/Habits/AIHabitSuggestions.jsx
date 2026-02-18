import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Plus, Loader2 } from 'lucide-react';

export default function AIHabitSuggestions({ goalId, onGenerate, onAddHabit, authHeaders }) {
    const { t } = useTranslation();
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const headers = await authHeaders();
            const res = await fetch('/api/habits/generate', {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ goalId }),
            });
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.habits || []);
            }
        } catch (error) {
            console.error('Error generating habits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (suggestion) => {
        await onAddHabit({
            title: suggestion.title,
            description: suggestion.description,
            frequency: suggestion.frequency || 'daily',
            goalId,
            isAIGenerated: true,
        });
        setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
    };

    const handleAddAll = async () => {
        for (const suggestion of suggestions) {
            await onAddHabit({
                title: suggestion.title,
                description: suggestion.description,
                frequency: suggestion.frequency || 'daily',
                goalId,
                isAIGenerated: true,
            });
        }
        setSuggestions([]);
    };

    if (!suggestions) {
        return (
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Sparkles size={16} />
                )}
                {loading ? t('habits.generating') : t('habits.generateFromGoal')}
            </button>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                    <Sparkles size={14} />
                    {t('habits.suggestions')}
                </h4>
                {suggestions.length > 1 && (
                    <button
                        onClick={handleAddAll}
                        className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700"
                    >
                        {t('habits.addAll')}
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {suggestions.map((s, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.title}</p>
                            {s.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => handleAdd(s)}
                            className="flex-shrink-0 p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
