import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import DeckList from '../components/Flashcards/DeckList';
import DeckDetail from '../components/Flashcards/DeckDetail';
import ReviewMode from '../components/Flashcards/ReviewMode';
import DeckSettings from '../components/Flashcards/DeckSettings';
import AddCards from '../components/Flashcards/AddCards';
import GenerateAI from '../components/Flashcards/GenerateAI';

export default function Flashcards() {
    const { getToken } = useAuth();
    const [view, setView] = useState('list');
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [dueCards, setDueCards] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [archivedDecks, setArchivedDecks] = useState([]);

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

    useEffect(() => { fetchDecks(); }, [fetchDecks]);

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

    const fetchArchivedDecks = useCallback(async () => {
        try {
            const config = await authHeaders();
            const res = await axios.get('/api/decks?archived=true', config);
            setArchivedDecks(res.data);
        } catch (error) {
            console.error('Failed to fetch archived decks:', error);
        }
    }, [authHeaders]);

    const handleToggleArchived = useCallback(async () => {
        const next = !showArchived;
        setShowArchived(next);
        if (next) fetchArchivedDecks();
    }, [showArchived, fetchArchivedDecks]);

    const handleUnarchiveDeck = async (deckId) => {
        try {
            const config = await authHeaders();
            await axios.patch(`/api/decks/${deckId}/settings`, { isArchived: false }, config);
            fetchDecks();
            fetchArchivedDecks();
        } catch (error) { console.error('Failed to unarchive deck:', error); }
    };

    const handleCreateDeck = async ({ title, description }) => {
        try {
            const config = await authHeaders();
            await axios.post('/api/decks', { title, description }, config);
            fetchDecks();
        } catch (error) { console.error('Failed to create deck:', error); }
    };

    const handleDeleteDeck = async (deckId) => {
        try {
            const config = await authHeaders();
            await axios.delete(`/api/decks/${deckId}`, config);
            fetchDecks();
        } catch (error) { console.error('Failed to delete deck:', error); }
    };

    const handleSelectDeck = (deck) => {
        setSelectedDeck(deck);
        setCards([]);
        setDueCards([]);
        setCardsLoading(true);
        setView('detail');
        Promise.all([fetchCards(deck.id), fetchDueCards(deck.id)])
            .finally(() => setCardsLoading(false));
    };

    const handleReviewDeck = (deck) => {
        setSelectedDeck(deck);
        fetchDueCards(deck.id);
        setView('review');
    };

    const handleAddCard = async ({ front, back }) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/cards`, { front, back }, config);
            fetchCards(selectedDeck.id);
        } catch (error) { console.error('Failed to add card:', error); }
    };

    const handleDeleteCard = async (cardId) => {
        try {
            const config = await authHeaders();
            await axios.delete(`/api/cards/${cardId}`, config);
            fetchCards(selectedDeck.id);
        } catch (error) { console.error('Failed to delete card:', error); }
    };

    const handleGenerate = async ({ topic, count, format }) => {
        if (!selectedDeck) return;
        setGenerating(true);
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/generate`, { topic, count, format }, config);
            fetchCards(selectedDeck.id);
        } catch (error) { console.error('Failed to generate cards:', error); }
        finally { setGenerating(false); }
    };

    const handleReview = async (cardId, quality) => {
        try {
            const config = await authHeaders();
            await axios.post(`/api/cards/${cardId}/review`, { quality }, config);
        } catch (error) { console.error('Failed to review card:', error); }
    };

    const handleEditCard = async (cardId, { front, back }) => {
        try {
            const config = await authHeaders();
            await axios.put(`/api/cards/${cardId}`, { front, back }, config);
            fetchCards(selectedDeck.id);
        } catch (error) { console.error('Failed to update card:', error); }
    };

    const handleEditDeck = async ({ title, description }) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            const res = await axios.put(`/api/decks/${selectedDeck.id}`, { title, description }, config);
            setSelectedDeck({ ...selectedDeck, title: res.data.title, description: res.data.description });
        } catch (error) { console.error('Failed to update deck:', error); }
    };

    const handleImport = async ({ cards: importCards, target, newDeckTitle, existingDeckId }) => {
        const config = await authHeaders();
        let deckId;
        if (target === 'new') {
            const res = await axios.post('/api/decks', { title: newDeckTitle }, config);
            deckId = res.data.id;
        } else {
            deckId = existingDeckId;
        }
        await axios.post(`/api/decks/${deckId}/import`, { cards: importCards }, config);
        fetchDecks();
        if (selectedDeck && deckId === selectedDeck.id) {
            fetchCards(selectedDeck.id);
        }
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedDeck(null);
        setCards([]);
        setDueCards([]);
        fetchDecks();
    };

    const handleSaveAlgorithmSettings = async ({ newCardsPerDay, maxCardsPerDay, shuffleCards, algorithm, desiredRetention }) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            const res = await axios.patch(`/api/decks/${selectedDeck.id}/settings`, {
                newCardsPerDay, maxCardsPerDay, shuffleCards, algorithm, desiredRetention
            }, config);
            setSelectedDeck(prev => ({ ...prev, ...res.data }));
        } catch (error) { console.error('Failed to save algorithm settings:', error); }
    };

    const handleRenameDeck = async (title) => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            const res = await axios.put(`/api/decks/${selectedDeck.id}`, { title }, config);
            setSelectedDeck(prev => ({ ...prev, title: res.data.title }));
            fetchDecks();
        } catch (error) { console.error('Failed to rename deck:', error); }
    };

    const handleDuplicateDeck = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/duplicate`, {}, config);
            handleBackToList();
        } catch (error) { console.error('Failed to duplicate deck:', error); }
    };

    const handleResetProgress = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.post(`/api/decks/${selectedDeck.id}/reset-progress`, {}, config);
            await fetchCards(selectedDeck.id);
            await fetchDueCards(selectedDeck.id);
            setView('detail');
        } catch (error) { console.error('Failed to reset progress:', error); }
    };

    const handleArchiveDeck = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.patch(`/api/decks/${selectedDeck.id}/settings`, { isArchived: true }, config);
            handleBackToList();
        } catch (error) { console.error('Failed to archive deck:', error); }
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
        } catch (error) { console.error('Failed to export deck:', error); }
    };

    const handleDeleteDeckFromSettings = async () => {
        if (!selectedDeck) return;
        try {
            const config = await authHeaders();
            await axios.delete(`/api/decks/${selectedDeck.id}`, config);
            handleBackToList();
        } catch (error) { console.error('Failed to delete deck:', error); }
    };

    const handleBackFromReview = async () => {
        if (selectedDeck) {
            await Promise.all([fetchCards(selectedDeck.id), fetchDueCards(selectedDeck.id)]);
        }
        setView('detail');
    };

    const handleBackFromAddCards = async () => {
        if (selectedDeck) {
            await fetchCards(selectedDeck.id);
        }
        setView('detail');
    };

    const handleBackFromGenerateAI = async () => {
        if (selectedDeck) {
            await fetchCards(selectedDeck.id);
        }
        setView('detail');
    };

    if (view === 'review' && dueCards.length > 0) {
        return (
            <ReviewMode
                cards={dueCards}
                onReview={handleReview}
                onBack={handleBackFromReview}
                onEditCard={handleEditCard}
                algorithm={selectedDeck?.algorithm ?? 'sm2'}
                desiredRetention={selectedDeck?.desiredRetention ?? 0.9}
            />
        );
    }

    if (view === 'settings' && selectedDeck) {
        return (
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
        );
    }

    if (view === 'add-cards' && selectedDeck) {
        return (
            <AddCards
                deck={selectedDeck}
                onAddCard={handleAddCard}
                onBack={handleBackFromAddCards}
            />
        );
    }

    if (view === 'generate-ai' && selectedDeck) {
        return (
            <GenerateAI
                deck={selectedDeck}
                onGenerate={handleGenerate}
                onBack={handleBackFromGenerateAI}
                generating={generating}
            />
        );
    }

    if (view === 'detail' && selectedDeck) {
        return (
            <DeckDetail
                deck={selectedDeck}
                cards={cards}
                decks={decks}
                dueCards={dueCards.length}
                cardsLoading={cardsLoading}
                onBack={handleBackToList}
                onDeleteCard={handleDeleteCard}
                onEditCard={handleEditCard}
                onEditDeck={handleEditDeck}
                onStudy={() => setView('review')}
                onOpenSettings={() => setView('settings')}
                onAddCards={() => setView('add-cards')}
                onGenerateAI={() => setView('generate-ai')}
                onImport={handleImport}
            />
        );
    }

    return (
        <DeckList
            decks={decks}
            onCreateDeck={handleCreateDeck}
            onDeleteDeck={handleDeleteDeck}
            onSelectDeck={handleSelectDeck}
            onReview={handleReviewDeck}
            onImport={handleImport}
            showArchived={showArchived}
            archivedDecks={archivedDecks}
            onToggleArchived={handleToggleArchived}
            onUnarchiveDeck={handleUnarchiveDeck}
        />
    );
}
