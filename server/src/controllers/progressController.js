import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOverview = async (req, res) => {
    const { userId } = req.auth;

    try {
        const [pomodoroAgg, tests, flashcardReviews, goals, habits] = await Promise.all([
            prisma.pomodoroSession.aggregate({
                where: { userId, wasCompleted: true },
                _sum: { durationMin: true },
                _count: true,
            }),
            prisma.test.findMany({
                where: { userId, completedAt: { not: null } },
                select: { score: true },
            }),
            prisma.flashcardReview.count({
                where: { card: { deck: { userId } } },
            }),
            prisma.goal.groupBy({
                by: ['status'],
                where: { userId },
                _count: true,
            }),
            prisma.habit.count({
                where: { userId, isArchived: false },
            }),
        ]);

        const totalMinutes = pomodoroAgg._sum.durationMin || 0;
        const totalSessions = pomodoroAgg._count || 0;
        const testsTaken = tests.length;
        const avgScore = testsTaken > 0
            ? Math.round(tests.reduce((sum, t) => sum + (t.score || 0), 0) / testsTaken)
            : 0;

        const goalStats = {};
        for (const g of goals) {
            goalStats[g.status] = g._count;
        }

        res.json({
            pomodoro: { totalSessions, totalMinutes },
            tests: { totalTaken: testsTaken, avgScore },
            flashcards: { totalReviews: flashcardReviews },
            goals: {
                total: Object.values(goalStats).reduce((s, c) => s + c, 0),
                completed: goalStats.completed || 0,
                active: goalStats.active || 0,
            },
            habits: { totalActive: habits },
        });
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
};

export const getWeeklyActivity = async (req, res) => {
    const { userId } = req.auth;

    try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        const startDate = new Date(days[0]);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(days[6]);
        endDate.setHours(23, 59, 59, 999);

        const [habitCompletions, pomodoroSessions, reviews, testCompletions] = await Promise.all([
            prisma.habitCompletion.findMany({
                where: {
                    habit: { userId },
                    date: { in: days },
                },
                select: { date: true },
            }),
            prisma.pomodoroSession.findMany({
                where: {
                    userId,
                    wasCompleted: true,
                    completedAt: { gte: startDate, lte: endDate },
                },
                select: { completedAt: true, durationMin: true },
            }),
            prisma.flashcardReview.findMany({
                where: {
                    card: { deck: { userId } },
                    reviewedAt: { gte: startDate, lte: endDate },
                },
                select: { reviewedAt: true },
            }),
            prisma.test.findMany({
                where: {
                    userId,
                    completedAt: { gte: startDate, lte: endDate },
                },
                select: { completedAt: true },
            }),
        ]);

        const result = days.map(date => {
            const dayName = new Date(date).toLocaleDateString('en', { weekday: 'short' });
            return {
                date,
                day: dayName,
                habits: habitCompletions.filter(c => c.date === date).length,
                pomodoroMinutes: pomodoroSessions
                    .filter(s => s.completedAt.toISOString().split('T')[0] === date)
                    .reduce((sum, s) => sum + s.durationMin, 0),
                reviews: reviews
                    .filter(r => r.reviewedAt.toISOString().split('T')[0] === date).length,
                tests: testCompletions
                    .filter(t => t.completedAt.toISOString().split('T')[0] === date).length,
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching weekly activity:', error);
        res.status(500).json({ error: 'Failed to fetch weekly activity' });
    }
};

export const getStudyTime = async (req, res) => {
    const { userId } = req.auth;
    const numDays = parseInt(req.query.days) || 30;

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - numDays);
        startDate.setHours(0, 0, 0, 0);

        const sessions = await prisma.pomodoroSession.findMany({
            where: {
                userId,
                wasCompleted: true,
                completedAt: { gte: startDate },
            },
            select: { completedAt: true, durationMin: true },
            orderBy: { completedAt: 'asc' },
        });

        const dayMap = {};
        for (const s of sessions) {
            const date = s.completedAt.toISOString().split('T')[0];
            if (!dayMap[date]) dayMap[date] = { date, minutes: 0, sessions: 0 };
            dayMap[date].minutes += s.durationMin;
            dayMap[date].sessions += 1;
        }

        res.json(Object.values(dayMap));
    } catch (error) {
        console.error('Error fetching study time:', error);
        res.status(500).json({ error: 'Failed to fetch study time' });
    }
};

export const getTestScores = async (req, res) => {
    const { userId } = req.auth;

    try {
        const tests = await prisma.test.findMany({
            where: { userId, completedAt: { not: null }, score: { not: null } },
            select: { topic: true, score: true, completedAt: true },
            orderBy: { completedAt: 'asc' },
            take: 20,
        });

        const result = tests.map(t => ({
            date: t.completedAt.toISOString().split('T')[0],
            topic: t.topic,
            score: t.score,
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching test scores:', error);
        res.status(500).json({ error: 'Failed to fetch test scores' });
    }
};
