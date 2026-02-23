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

import {
    generatePlanFromGoal, savePlan, getUserPlans, toggleTask,
    updatePlan, deletePlan,
    addModule, updateModule, deleteModule, reorderModules,
    addTask, updateTask, deleteTask
} from './controllers/planController.js';
import {
    getDecks, createDeck, deleteDeck,
    getDeckCards, addCard, deleteCard,
    generateCards, getDueCards, reviewCard
} from './controllers/flashcardController.js';
import { saveSession, getSessions } from './controllers/pomodoroController.js';
import { generateTest, submitTest, getUserTests, getTest, deleteTest } from './controllers/testController.js';
import { createGoal, getUserGoals, getGoal, updateGoal, deleteGoal, updateMilestones, toggleMilestone } from './controllers/goalController.js';
import { savePreferences, getPreferences, updatePreferences } from './controllers/preferencesController.js';
import {
    generateHabits, createHabit, getUserHabits, getTodayHabits,
    completeHabit, uncompleteHabit, updateHabit, deleteHabit,
    getStreaks, getHabitStats
} from './controllers/habitController.js';
import {
    getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification
} from './controllers/notificationController.js';
import { getOverview, getWeeklyActivity, getStudyTime, getTestScores } from './controllers/progressController.js';

// Plan Endpoints
app.get('/api/plans', requireAuth, getUserPlans);
app.post('/api/plans/generate', requireAuth, generatePlanFromGoal);
app.post('/api/plans', requireAuth, savePlan);
app.put('/api/plans/:planId', requireAuth, updatePlan);
app.delete('/api/plans/:planId', requireAuth, deletePlan);
app.patch('/api/tasks/:taskId/toggle', requireAuth, toggleTask);
app.post('/api/plans/:planId/modules', requireAuth, addModule);
app.put('/api/modules/:moduleId', requireAuth, updateModule);
app.delete('/api/modules/:moduleId', requireAuth, deleteModule);
app.put('/api/plans/:planId/reorder', requireAuth, reorderModules);
app.post('/api/modules/:moduleId/tasks', requireAuth, addTask);
app.put('/api/tasks/:taskId', requireAuth, updateTask);
app.delete('/api/tasks/:taskId', requireAuth, deleteTask);

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
app.delete('/api/tests/:testId', requireAuth, deleteTest);

// Preferences Endpoints
app.post('/api/preferences', requireAuth, savePreferences);
app.get('/api/preferences', requireAuth, getPreferences);
app.patch('/api/preferences', requireAuth, updatePreferences);

// Goal Endpoints
app.post('/api/goals', requireAuth, createGoal);
app.get('/api/goals', requireAuth, getUserGoals);
app.get('/api/goals/:goalId', requireAuth, getGoal);
app.put('/api/goals/:goalId', requireAuth, updateGoal);
app.delete('/api/goals/:goalId', requireAuth, deleteGoal);
app.put('/api/goals/:goalId/milestones', requireAuth, updateMilestones);
app.patch('/api/milestones/:milestoneId/toggle', requireAuth, toggleMilestone);

// Habit Endpoints
app.post('/api/habits/generate', requireAuth, generateHabits);
app.post('/api/habits', requireAuth, createHabit);
app.get('/api/habits', requireAuth, getUserHabits);
app.get('/api/habits/today', requireAuth, getTodayHabits);
app.post('/api/habits/:habitId/complete', requireAuth, completeHabit);
app.delete('/api/habits/:habitId/complete', requireAuth, uncompleteHabit);
app.put('/api/habits/:habitId', requireAuth, updateHabit);
app.delete('/api/habits/:habitId', requireAuth, deleteHabit);
app.get('/api/habits/streaks', requireAuth, getStreaks);
app.get('/api/habits/stats', requireAuth, getHabitStats);

// Notification Endpoints
app.get('/api/notifications', requireAuth, getNotifications);
app.get('/api/notifications/unread-count', requireAuth, getUnreadCount);
app.patch('/api/notifications/:notificationId/read', requireAuth, markAsRead);
app.patch('/api/notifications/read-all', requireAuth, markAllAsRead);
app.delete('/api/notifications/:notificationId', requireAuth, deleteNotification);

// Progress Endpoints
app.get('/api/progress/overview', requireAuth, getOverview);
app.get('/api/progress/weekly-activity', requireAuth, getWeeklyActivity);
app.get('/api/progress/study-time', requireAuth, getStudyTime);
app.get('/api/progress/test-scores', requireAuth, getTestScores);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
