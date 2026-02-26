import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { schedule } from '../utils/sm2.js';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

export const getDecks = async (req, res) => {
    const { userId } = req.auth;

    try {
        const decks = await prisma.deck.findMany({
            where: { userId, isArchived: false },
            include: {
                cards: {
                    select: { id: true, nextReviewAt: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const now = new Date();
        const result = decks.map(deck => ({
            id: deck.id,
            title: deck.title,
            description: deck.description,
            newCardsPerDay: deck.newCardsPerDay,
            maxCardsPerDay: deck.maxCardsPerDay,
            shuffleCards: deck.shuffleCards,
            algorithm: deck.algorithm,
            desiredRetention: deck.desiredRetention,
            createdAt: deck.createdAt,
            updatedAt: deck.updatedAt,
            totalCards: deck.cards.length,
            dueCards: deck.cards.filter(c => c.nextReviewAt <= now).length,
        }));

        res.json(result);
    } catch (error) {
        console.error("Error fetching decks:", error);
        res.status(500).json({ error: "Failed to fetch decks" });
    }
};

export const createDeck = async (req, res) => {
    const { userId } = req.auth;
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {},
            create: { clerkId: userId, email: `${userId}@placeholder.com` },
        });

        const deck = await prisma.deck.create({
            data: { userId, title, description: description || null }
        });

        res.json({ ...deck, totalCards: 0, dueCards: 0 });
    } catch (error) {
        console.error("Error creating deck:", error);
        res.status(500).json({ error: "Failed to create deck" });
    }
};

export const deleteDeck = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        await prisma.deck.delete({ where: { id: deckId } });
        res.json({ message: "Deck deleted" });
    } catch (error) {
        console.error("Error deleting deck:", error);
        res.status(500).json({ error: "Failed to delete deck" });
    }
};

export const getDeckCards = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const cards = await prisma.flashcard.findMany({
            where: { deckId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(cards);
    } catch (error) {
        console.error("Error fetching cards:", error);
        res.status(500).json({ error: "Failed to fetch cards" });
    }
};

export const addCard = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;
    const { front, back } = req.body;

    if (!front || !back) {
        return res.status(400).json({ error: "Front and back are required" });
    }

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const card = await prisma.flashcard.create({
            data: { deckId, front, back }
        });

        res.json(card);
    } catch (error) {
        console.error("Error adding card:", error);
        res.status(500).json({ error: "Failed to add card" });
    }
};

export const updateDeck = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;
    const { title, description } = req.body;

    if (!title?.trim()) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const updated = await prisma.deck.update({
            where: { id: deckId },
            data: { title: title.trim(), description: description?.trim() || null }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating deck:", error);
        res.status(500).json({ error: "Failed to update deck" });
    }
};

export const updateCard = async (req, res) => {
    const { userId } = req.auth;
    const { cardId } = req.params;
    const { front, back } = req.body;

    if (!front?.trim() || !back?.trim()) {
        return res.status(400).json({ error: "Front and back are required" });
    }

    try {
        const card = await prisma.flashcard.findFirst({
            where: { id: cardId, deck: { userId } }
        });

        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }

        const updated = await prisma.flashcard.update({
            where: { id: cardId },
            data: { front: front.trim(), back: back.trim() }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({ error: "Failed to update card" });
    }
};

export const deleteCard = async (req, res) => {
    const { userId } = req.auth;
    const { cardId } = req.params;

    try {
        const card = await prisma.flashcard.findFirst({
            where: { id: cardId, deck: { userId } }
        });

        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }

        await prisma.flashcard.delete({ where: { id: cardId } });
        res.json({ message: "Card deleted" });
    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(500).json({ error: "Failed to delete card" });
    }
};

export const generateCards = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;
    const { topic, count = 10 } = req.body;

    if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
    }

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a flashcard generator. Create concise, clear flashcards for studying." },
                {
                    role: "user",
                    content: `Generate ${count} flashcards for studying: "${topic}". Return valid JSON: { "cards": [{ "front": "question or term", "back": "answer or definition" }] }`
                }
            ],
            response_format: { type: "json_object" },
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        const cardsData = parsed.cards || [];

        const created = await Promise.all(
            cardsData.map(c =>
                prisma.flashcard.create({
                    data: { deckId, front: c.front, back: c.back }
                })
            )
        );

        res.json(created);
    } catch (error) {
        console.error("Error generating cards:", error);
        res.status(500).json({ error: "Failed to generate cards" });
    }
};

export const importCards = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;
    const { cards } = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
        return res.status(400).json({ error: "Cards array is required and must not be empty" });
    }

    const validCards = cards.filter(c => c.front?.trim() && c.back?.trim());
    if (validCards.length === 0) {
        return res.status(400).json({ error: "No valid cards found. Each card needs a front and back." });
    }

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const result = await prisma.flashcard.createMany({
            data: validCards.map(c => ({
                deckId,
                front: c.front.trim(),
                back: c.back.trim(),
            })),
        });

        res.json({ count: result.count });
    } catch (error) {
        console.error("Error importing cards:", error);
        res.status(500).json({ error: "Failed to import cards" });
    }
};

export const getDueCards = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const cards = await prisma.flashcard.findMany({
            where: {
                deckId,
                nextReviewAt: { lte: new Date() }
            },
            orderBy: { nextReviewAt: 'asc' }
        });

        res.json(cards);
    } catch (error) {
        console.error("Error fetching due cards:", error);
        res.status(500).json({ error: "Failed to fetch due cards" });
    }
};

export const reviewCard = async (req, res) => {
    const { userId } = req.auth;
    const { cardId } = req.params;
    const { quality } = req.body;

    if (![1, 3, 4, 5].includes(Number(quality))) {
        return res.status(400).json({ error: "Quality must be 1 (Again), 3 (Hard), 4 (Good), or 5 (Easy)" });
    }

    try {
        const card = await prisma.flashcard.findFirst({
            where: { id: cardId, deck: { userId } },
            include: { deck: { select: { algorithm: true, desiredRetention: true } } },
        });

        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }

        const result = schedule(Number(quality), card, {
            algorithm: card.deck.algorithm ?? 'sm2',
            desiredRetention: card.deck.desiredRetention ?? 0.9,
        });

        const updated = await prisma.flashcard.update({
            where: { id: cardId },
            data: {
                state: result.state,
                stepIndex: result.stepIndex ?? 0,
                lapses: result.lapses ?? 0,
                easeFactor: result.easeFactor ?? 2.5,
                interval: result.interval,
                repetitions: result.repetitions,
                stability: result.stability ?? card.stability,
                difficulty: result.difficulty ?? card.difficulty,
                nextReviewAt: result.nextReviewAt,
                lastReviewedAt: new Date(),
            }
        });

        await prisma.flashcardReview.create({
            data: { cardId, quality }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error reviewing card:", error);
        res.status(500).json({ error: "Failed to review card" });
    }
};

export const updateDeckSettings = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;
    const { newCardsPerDay, maxCardsPerDay, shuffleCards, isArchived, algorithm, desiredRetention } = req.body;

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const data = {};
        if (newCardsPerDay !== undefined) data.newCardsPerDay = Number(newCardsPerDay);
        if (maxCardsPerDay !== undefined) data.maxCardsPerDay = Number(maxCardsPerDay);
        if (shuffleCards !== undefined) data.shuffleCards = Boolean(shuffleCards);
        if (isArchived !== undefined) data.isArchived = Boolean(isArchived);
        if (algorithm !== undefined && ['sm2', 'fsrs'].includes(algorithm)) data.algorithm = algorithm;
        if (desiredRetention !== undefined) data.desiredRetention = Math.max(0.1, Math.min(0.99, Number(desiredRetention)));

        const updated = await prisma.deck.update({
            where: { id: deckId },
            data,
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating deck settings:", error);
        res.status(500).json({ error: "Failed to update deck settings" });
    }
};

export const duplicateDeck = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId },
            include: { cards: true }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const newDeck = await prisma.deck.create({
            data: {
                userId,
                title: `${deck.title} (copy)`,
                description: deck.description,
                newCardsPerDay: deck.newCardsPerDay,
                maxCardsPerDay: deck.maxCardsPerDay,
                shuffleCards: deck.shuffleCards,
            }
        });

        if (deck.cards.length > 0) {
            await prisma.flashcard.createMany({
                data: deck.cards.map(c => ({
                    deckId: newDeck.id,
                    front: c.front,
                    back: c.back,
                }))
            });
        }

        res.json({ ...newDeck, totalCards: deck.cards.length, dueCards: deck.cards.length });
    } catch (error) {
        console.error("Error duplicating deck:", error);
        res.status(500).json({ error: "Failed to duplicate deck" });
    }
};

export const resetProgress = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId },
            include: { cards: { select: { id: true } } }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const cardIds = deck.cards.map(c => c.id);

        await prisma.flashcardReview.deleteMany({
            where: { cardId: { in: cardIds } }
        });

        await prisma.flashcard.updateMany({
            where: { deckId },
            data: {
                state: 'new',
                stepIndex: 0,
                lapses: 0,
                easeFactor: 2.5,
                interval: 0,
                repetitions: 0,
                stability: 0,
                difficulty: 5,
                nextReviewAt: new Date(),
                lastReviewedAt: null,
            }
        });

        res.json({ message: "Progress reset" });
    } catch (error) {
        console.error("Error resetting progress:", error);
        res.status(500).json({ error: "Failed to reset progress" });
    }
};

export const exportDeck = async (req, res) => {
    const { userId } = req.auth;
    const { deckId } = req.params;

    try {
        const deck = await prisma.deck.findFirst({
            where: { id: deckId, userId },
            include: { cards: true }
        });

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" });
        }

        const escapeCSV = (str) => {
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = ['front,back', ...deck.cards.map(c => `${escapeCSV(c.front)},${escapeCSV(c.back)}`)];
        const csv = rows.join('\n');
        const filename = deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error("Error exporting deck:", error);
        res.status(500).json({ error: "Failed to export deck" });
    }
};
