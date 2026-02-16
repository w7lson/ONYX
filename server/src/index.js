import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { handleClerkWebhook } from './controllers/webhookController.js';
import { requireAuth } from './middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());

// Webhook route needs raw body for signature verification
app.post(
    '/api/webhooks/clerk',
    express.raw({ type: 'application/json' }),
    handleClerkWebhook
);

// Regular JSON middleware for other routes
app.use(express.json());

// Public Route
app.get('/', (req, res) => {
    res.send('AI Learning System API is running');
});

// Protected Route Example
app.get('/api/protected', requireAuth, (req, res) => {
    res.json({ message: 'This is a protected route', auth: req.auth });
});

import { generatePlan, getUserPlans } from './controllers/planController.js';
import {
    getDecks, createDeck, deleteDeck,
    getDeckCards, addCard, deleteCard,
    generateCards, getDueCards, reviewCard
} from './controllers/flashcardController.js';
import { saveSession, getSessions } from './controllers/pomodoroController.js';
import { generateTest, submitTest, getUserTests, getTest } from './controllers/testController.js';

// Plan Endpoints
app.get('/api/plans', requireAuth, getUserPlans);
app.post('/api/plans/generate', requireAuth, generatePlan);

// Flashcard Endpoints
app.get('/api/decks', requireAuth, getDecks);
app.post('/api/decks', requireAuth, createDeck);
app.delete('/api/decks/:deckId', requireAuth, deleteDeck);
app.get('/api/decks/:deckId/cards', requireAuth, getDeckCards);
app.post('/api/decks/:deckId/cards', requireAuth, addCard);
app.delete('/api/cards/:cardId', requireAuth, deleteCard);
app.post('/api/decks/:deckId/generate', requireAuth, generateCards);
app.get('/api/decks/:deckId/review', requireAuth, getDueCards);
app.post('/api/cards/:cardId/review', requireAuth, reviewCard);

// Pomodoro Endpoints
app.post('/api/pomodoro/sessions', requireAuth, saveSession);
app.get('/api/pomodoro/sessions', requireAuth, getSessions);

// Test Endpoints
app.post('/api/tests/generate', requireAuth, generateTest);
app.post('/api/tests/:testId/submit', requireAuth, submitTest);
app.get('/api/tests', requireAuth, getUserTests);
app.get('/api/tests/:testId', requireAuth, getTest);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
