import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import DeckList from '../components/Flashcards/DeckList';
import DeckDetail from '../components/Flashcards/DeckDetail';
import ReviewMode from '../components/Flashcards/ReviewMode';

export default function Flashcards() {
    const { getToken } = useAuth();
    const [view, setView] = useState('list'); // 'list' | 'detail' | 'review'
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

    const fetchCards = async (deckId) => {
        try {
            const config = await authHeaders();
            const res = await axios.get(`/api/decks/${deckId}/cards`, config);
            setCards(res.data);
        } catch (error) {
            console.error('Failed to fetch cards:', error);
        }
    };

    const fetchDueCards = async (deckId) => {
        try {
            const config = await authHeaders();
            const res = await axios.get(`/api/decks/${deckId}/review`, config);
            setDueCards(res.data);
        } catch (error) {
            console.error('Failed to fetch due cards:', error);
        }
    };

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

    const handleSelectDeck = (deck) => {
        setSelectedDeck(deck);
        fetchCards(deck.id);
        setView('detail');
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

    const handleBackToList = () => {
        setView('list');
        setSelectedDeck(null);
        setCards([]);
        setDueCards([]);
        fetchDecks();
    };

    if (view === 'review' && dueCards.length > 0) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <ReviewMode
                    cards={dueCards}
                    onReview={handleReview}
                    onBack={handleBackToList}
                />
            </div>
        );
    }

    if (view === 'detail' && selectedDeck) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <DeckDetail
                    deck={selectedDeck}
                    cards={cards}
                    onBack={handleBackToList}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    onGenerate={handleGenerate}
                    generating={generating}
                />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <DeckList
                decks={decks}
                onCreateDeck={handleCreateDeck}
                onDeleteDeck={handleDeleteDeck}
                onSelectDeck={handleSelectDeck}
                onReview={handleReviewDeck}
            />
        </div>
    );
}
