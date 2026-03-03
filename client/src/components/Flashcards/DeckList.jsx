import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Layers, Upload } from 'lucide-react';
import ImportCSV from './ImportCSV';

export default function DeckList({ decks, onCreateDeck, onDeleteDeck, onSelectDeck, onReview, onImport }) {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [showImport, setShowImport] = useState(false);
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
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {t('flashcards.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('flashcards.subtitle')}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => { setShowImport(!showImport); setShowCreate(false); }}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700 transition-colors text-sm"
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">{t('flashcards.import.button')}</span>
                        <span className="sm:hidden">Import</span>
                    </button>
                    <button
                        onClick={() => { setShowCreate(!showCreate); setShowImport(false); }}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors text-sm"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">{t('flashcards.createDeck')}</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>
            </div>

            {showCreate && (
                <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-5 mb-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('flashcards.deckTitle')}
                        className="w-full px-4 py-2 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('flashcards.deckDescription')}
                        className="w-full px-4 py-2 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                        >
                            {t('flashcards.create')}
                        </button>
                        <button
                            onClick={() => setShowCreate(false)}
                            className="px-4 py-2 bg-white/[0.06] text-slate-300 rounded-md font-medium hover:bg-white/[0.10] transition-colors"
                        >
                            {t('flashcards.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {showImport && (
                <ImportCSV
                    decks={decks}
                    onImport={async (data) => { await onImport(data); setShowImport(false); }}
                    onClose={() => setShowImport(false)}
                />
            )}

            {decks.length === 0 ? (
                <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-6 text-center">
                    <Layers size={40} className="text-primary-500 mx-auto mb-3" />
                    <p className="text-slate-400">{t('flashcards.noDecks')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {decks.map((deck) => (
                        <div
                            key={deck.id}
                            className="bg-[#161A22] rounded-lg border border-white/[0.06] p-5 hover:border-primary-900 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.12)] transition-all cursor-pointer"
                        >
                            <div
                                className="cursor-pointer"
                                onClick={() => onSelectDeck(deck)}
                            >
                                <h3 className="font-semibold text-slate-100 text-lg mb-1">
                                    {deck.title}
                                </h3>
                                {deck.description && (
                                    <p className="text-sm text-slate-400 mb-3">{deck.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <span>{t('flashcards.cards', { count: deck.totalCards })}</span>
                                    {deck.dueCards > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-medium">
                                            {t('flashcards.dueCards', { count: deck.dueCards })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                                {deck.dueCards > 0 && (
                                    <button
                                        onClick={() => onReview(deck)}
                                        className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md font-medium hover:bg-primary-700 transition-colors"
                                    >
                                        {t('flashcards.review')}
                                    </button>
                                )}
                                <button
                                    onClick={() => onDeleteDeck(deck.id)}
                                    className="ml-auto p-1.5 text-slate-500 hover:text-red-400 transition-colors"
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
