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

// Plan Endpoints
app.get('/api/plans', requireAuth, getUserPlans);
app.post('/api/plans/generate', requireAuth, generatePlan);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
