import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const saveSession = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { durationMin, wasCompleted = true, label } = req.body;

    if (!durationMin) {
        return res.status(400).json({ error: "durationMin is required" });
    }

    await prisma.userProfile.upsert({
        where: { clerkId: userId },
        update: {},
        create: { clerkId: userId, email: `${userId}@placeholder.com` },
    });

    const session = await prisma.pomodoroSession.create({
        data: {
            userId,
            durationMin,
            wasCompleted,
            label: label || null,
        }
    });

    res.json(session);
});

export const getSessions = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const limit = parseInt(req.query.limit) || 50;

    const sessions = await prisma.pomodoroSession.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: limit,
    });

    res.json(sessions);
});
