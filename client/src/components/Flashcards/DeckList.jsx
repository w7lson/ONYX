import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Layers } from 'lucide-react';

export default function DeckList({ decks, onCreateDeck, onDeleteDeck, onSelectDeck, onReview }) {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = () => {
        if (!title.trim()) return;
        onCreateDeck({ title: title.trim(), description: description.trim() || undefined });
        setTitle('');
        setDescription('');
        setShowCreate(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {t('flashcards.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('flashcards.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    {t('flashcards.createDeck')}
                </button>
            </div>

            {showCreate && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('flashcards.deckTitle')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('flashcards.deckDescription')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            {t('flashcards.create')}
                        </button>
                        <button
                            onClick={() => setShowCreate(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('flashcards.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {decks.length === 0 ? (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                    <Layers size={40} className="text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300">{t('flashcards.noDecks')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {decks.map((deck) => (
                        <div
                            key={deck.id}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div
                                className="cursor-pointer"
                                onClick={() => onSelectDeck(deck)}
                            >
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-1">
                                    {deck.title}
                                </h3>
                                {deck.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{deck.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{t('flashcards.cards', { count: deck.totalCards })}</span>
                                    {deck.dueCards > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-medium">
                                            {t('flashcards.dueCards', { count: deck.dueCards })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                {deck.dueCards > 0 && (
                                    <button
                                        onClick={() => onReview(deck)}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        {t('flashcards.review')}
                                    </button>
                                )}
                                <button
                                    onClick={() => onDeleteDeck(deck.id)}
                                    className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
