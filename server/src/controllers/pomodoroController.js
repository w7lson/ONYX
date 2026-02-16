import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const saveSession = async (req, res) => {
    const { userId } = req.auth;
    const { durationMin, wasCompleted = true, label } = req.body;

    if (!durationMin) {
        return res.status(400).json({ error: "durationMin is required" });
    }

    try {
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
    } catch (error) {
        console.error("Error saving session:", error);
        res.status(500).json({ error: "Failed to save session" });
    }
};

export const getSessions = async (req, res) => {
    const { userId } = req.auth;
    const limit = parseInt(req.query.limit) || 50;

    try {
        const sessions = await prisma.pomodoroSession.findMany({
            where: { userId },
            orderBy: { completedAt: 'desc' },
            take: limit,
        });

        res.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
};
