import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { sm2 } from '../utils/sm2.js';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

export const getDecks = async (req, res) => {
    const { userId } = req.auth;

    try {
        const decks = await prisma.deck.findMany({
            where: { userId },
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

    if (quality === undefined || quality < 0 || quality > 5) {
        return res.status(400).json({ error: "Quality must be between 0 and 5" });
    }

    try {
        const card = await prisma.flashcard.findFirst({
            where: { id: cardId, deck: { userId } }
        });

        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }

        const result = sm2(quality, card.repetitions, card.easeFactor, card.interval);

        const updated = await prisma.flashcard.update({
            where: { id: cardId },
            data: {
                easeFactor: result.easeFactor,
                interval: result.interval,
                repetitions: result.repetitions,
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
