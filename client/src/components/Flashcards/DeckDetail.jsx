import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';

export default function DeckDetail({ deck, cards, onBack, onAddCard, onDeleteCard, onGenerate, generating }) {
    const { t } = useTranslation();
    const [showAddCard, setShowAddCard] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [topic, setTopic] = useState('');
    const [count, setCount] = useState(10);

    const handleAddCard = () => {
        if (!front.trim() || !back.trim()) return;
        onAddCard({ front: front.trim(), back: back.trim() });
        setFront('');
        setBack('');
    };

    const handleGenerate = () => {
        if (!topic.trim()) return;
        onGenerate({ topic: topic.trim(), count });
        setTopic('');
        setShowGenerate(false);
    };

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('flashcards.backToDecks')}
            </button>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{deck.title}</h1>
                    {deck.description && (
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{deck.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setShowAddCard(!showAddCard); setShowGenerate(false); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        {t('flashcards.addCard')}
                    </button>
                    <button
                        onClick={() => { setShowGenerate(!showGenerate); setShowAddCard(false); }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                        <Sparkles size={18} />
                        {t('flashcards.generateAI')}
                    </button>
                </div>
            </div>

            {showAddCard && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
                    <textarea
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        placeholder={t('flashcards.front')}
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <textarea
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        placeholder={t('flashcards.back')}
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                        onClick={handleAddCard}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        {t('flashcards.add')}
                    </button>
                </div>
            )}

            {showGenerate && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-purple-200 dark:border-purple-800 p-5 mb-6">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t('flashcards.topic')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm text-gray-600 dark:text-gray-400">{t('flashcards.numberOfCards')}</label>
                        <input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                            min={1}
                            max={20}
                            className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {generating ? t('flashcards.generating') : t('flashcards.generate')}
                    </button>
                </div>
            )}

            {cards.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('flashcards.noCards')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-start justify-between"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 dark:text-gray-100">{card.front}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.back}</p>
                            </div>
                            <button
                                onClick={() => onDeleteCard(card.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0 ml-3"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
