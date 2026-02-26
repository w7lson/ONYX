import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import DeckList from '../components/Flashcards/DeckList';
import DeckDetail from '../components/Flashcards/DeckDetail';
import ReviewMode from '../components/Flashcards/ReviewMode';
import DeckSettings from '../components/Flashcards/DeckSettings';

export default function Flashcards() {
    const { getToken } = useAuth();
    const [view, setView] = useState('list'); // 'list' | 'detail' | 'review' | 'settings'
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [dueCards, setDueCards] = useState([]);
    const [generating, setGenerating] = useState(false);

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    }, [getToken]);

    const fetchDecks = useCallback(async () => {
        try {
            const config = await authHeaders();
            const res = await axios.get('/api/decks', config);
            setDecks(res.data);
        } catch (error) {
            console.error('Failed to fetch decks:', error);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

    const fetchCards = useCallback(async (deckId) => {
        try {
            const config = await authHeaders();
            const res = await axios.get(`/api/decks/${deckId}/cards`, config);
            setCards(res.data);
        } catch (error) {
            console.error('Failed to fetch cards:', error);
        }
    }, [authHeaders]);

    const fetchDueCards = useCallback(async (deckId) => {
        try {
            const config = await authHeaders();
            const res = await axios.get(`/api/decks/${deckId}/review`, config);
            setDueCards(res.data);
        } catch (error) {
            console.error('Failed to fetch due cards:', error);
        }
    }, [authHeaders]);

    const handleCreateDeck = async ({ title, description }) => {
        try {
            const config = await authHeaders();
            await axios.post('/api/decks', { title, description }, config);
            fetchDecks();
        } catch (error) {
            console.error('Failed to create deck:', error);
        }
    };

    const handleDeleteDeck = async (deckId) => {
        try {
            const config = await authHeaders();
            await axios.delete(`/api/decks/${deckId}`, config);
            fetchDecks();
        } catch (error) {
            console.error('Failed to delete deck:', error);
        }
    };

    const handleSelectDeck = async (deck) => {
        setSelectedDeck(deck);
        await Promise.all([fetchCards(deck.id), fetchDueCards(deck.id)]);
        setView('detail');
    };

    const handleReviewDeck = (deck) => {
        setSelectedDeck(deck);
        fetchDueCards(deck.id);
        setView('review');
    };

    const handleStudyDeck = () => {
        setView('review');
    };

    const handleAddCard = async ({ front, back }) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/cards`, { front, back }, config);
            fetchCards(selectedDeck.id);
        } catch (error) {
            console.error('Failed to add card:', error);
        }
    };

    const handleDeleteCard = async (cardId) => {
        try {
            const config = await authHeaders();
            await axios.delete(`/api/cards/${cardId}`, config);
            fetchCards(selectedDeck.id);
        } catch (error) {
            console.error('Failed to delete card:', error);
        }
    };

    const handleGenerate = async ({ topic, count }) => {
        if (!selectedDeck) return;
        setGenerating(true);
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/generate`, { topic, count }, config);
            fetchCards(selectedDeck.id);
        } catch (error) {
            console.error('Failed to generate cards:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleReview = async (cardId, quality) => {
        try {
            const config = await authHeaders();
            await axios.post(`/api/cards/${cardId}/review`, { quality }, config);
        } catch (error) {
            console.error('Failed to review card:', error);
        }
    };

    const handleEditCard = async (cardId, { front, back }) => {
        try {
            const config = await authHeaders();
            await axios.put(`/api/cards/${cardId}`, { front, back }, config);
            fetchCards(selectedDeck.id);
        } catch (error) {
            console.error('Failed to update card:', error);
        }
    };

    const handleEditDeck = async ({ title, description }) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            const res = await axios.put(`/api/decks/${selectedDeck.id}`, { title, description }, config);
            setSelectedDeck({ ...selectedDeck, title: res.data.title, description: res.data.description });
        } catch (error) {
            console.error('Failed to update deck:', error);
        }
    };

    const handleImport = async ({ cards, target, newDeckTitle, existingDeckId }) => {
        const config = await authHeaders();
        let deckId;

        if (target === 'new') {
            const res = await axios.post('/api/decks', { title: newDeckTitle }, config);
            deckId = res.data.id;
        } else {
            deckId = existingDeckId;
        }

        await axios.post(`/api/decks/${deckId}/import`, { cards }, config);
        fetchDecks();
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedDeck(null);
        setCards([]);
        setDueCards([]);
        fetchDecks();
    };

    const handleOpenSettings = () => {
        setView('settings');
    };

    const handleSaveAlgorithmSettings = async ({ newCardsPerDay, maxCardsPerDay, shuffleCards, algorithm, desiredRetention }) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            const res = await axios.patch(`/api/decks/${selectedDeck.id}/settings`, {
                newCardsPerDay, maxCardsPerDay, shuffleCards, algorithm, desiredRetention
            }, config);
            setSelectedDeck(prev => ({
                ...prev,
                newCardsPerDay: res.data.newCardsPerDay,
                maxCardsPerDay: res.data.maxCardsPerDay,
                shuffleCards: res.data.shuffleCards,
                algorithm: res.data.algorithm,
                desiredRetention: res.data.desiredRetention,
            }));
        } catch (error) {
            console.error('Failed to save algorithm settings:', error);
        }
    };

    const handleRenameDeck = async (title) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            const res = await axios.put(`/api/decks/${selectedDeck.id}`, { title }, config);
            setSelectedDeck(prev => ({ ...prev, title: res.data.title }));
            fetchDecks();
        } catch (error) {
            console.error('Failed to rename deck:', error);
        }
    };

    const handleDuplicateDeck = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/duplicate`, {}, config);
            handleBackToList();
        } catch (error) {
            console.error('Failed to duplicate deck:', error);
        }
    };

    const handleResetProgress = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/reset-progress`, {}, config);
            await fetchCards(selectedDeck.id);
            await fetchDueCards(selectedDeck.id);
            setView('detail');
        } catch (error) {
            console.error('Failed to reset progress:', error);
        }
    };

    const handleArchiveDeck = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.patch(`/api/decks/${selectedDeck.id}/settings`, { isArchived: true }, config);
            handleBackToList();
        } catch (error) {
            console.error('Failed to archive deck:', error);
        }
    };

    const handleExportDeck = async () => {
        if (!selectedDeck) return;
        try {
            const token = await getToken();
            const res = await fetch(`/api/decks/${selectedDeck.id}/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedDeck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export deck:', error);
        }
    };

    const handleDeleteDeckFromSettings = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.delete(`/api/decks/${selectedDeck.id}`, config);
            handleBackToList();
        } catch (error) {
            console.error('Failed to delete deck:', error);
        }
    };

    const handleBackFromReview = async () => {
        if (selectedDeck) {
            await Promise.all([fetchCards(selectedDeck.id), fetchDueCards(selectedDeck.id)]);
        }
        setView('detail');
    };

    if (view === 'review' && dueCards.length > 0) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <ReviewMode
                    cards={dueCards}
                    onReview={handleReview}
                    onBack={handleBackFromReview}
                    onEditCard={handleEditCard}
                    algorithm={selectedDeck?.algorithm ?? 'sm2'}
                    desiredRetention={selectedDeck?.desiredRetention ?? 0.9}
                />
            </div>
        );
    }

    if (view === 'settings' && selectedDeck) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <DeckSettings
                    deck={selectedDeck}
                    onBack={() => setView('detail')}
                    onRename={handleRenameDeck}
                    onDuplicate={handleDuplicateDeck}
                    onResetProgress={handleResetProgress}
                    onArchive={handleArchiveDeck}
                    onExport={handleExportDeck}
                    onDelete={handleDeleteDeckFromSettings}
                    onSaveAlgorithmSettings={handleSaveAlgorithmSettings}
                />
            </div>
        );
    }

    if (view === 'detail' && selectedDeck) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <DeckDetail
                    deck={selectedDeck}
                    cards={cards}
                    dueCards={dueCards.length}
                    onBack={handleBackToList}
                    onDeleteCard={handleDeleteCard}
                    onEditCard={handleEditCard}
                    onEditDeck={handleEditDeck}
                    onStudy={handleStudyDeck}
                    onOpenSettings={handleOpenSettings}
                    onAddCard={handleAddCard}
                    onGenerate={handleGenerate}
                    generating={generating}
                />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <DeckList
                decks={decks}
                onCreateDeck={handleCreateDeck}
                onDeleteDeck={handleDeleteDeck}
                onSelectDeck={handleSelectDeck}
                onReview={handleReviewDeck}
                onImport={handleImport}
            />
        </div>
    );
}
