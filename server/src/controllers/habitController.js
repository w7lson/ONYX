import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function isDueToday(habit) {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekly') {
        const dayOfWeek = new Date().getDay();
        const days = habit.daysOfWeek;
        return Array.isArray(days) && days.includes(dayOfWeek);
    }
    if (habit.frequency === 'custom') {
        const dayOfWeek = new Date().getDay();
        const days = habit.daysOfWeek;
        return Array.isArray(days) && days.includes(dayOfWeek);
    }
    return true;
}

export const generateHabits = async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.body;

    if (!goalId) {
        return res.status(400).json({ error: "goalId is required" });
    }

    try {
        const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }

        const profile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
            select: { primaryGoal: true, currentLevel: true, pace: true, reviewFrequency: true }
        });

        const prompt = `You are a goal-achievement coach. Given this goal and user profile, suggest 3-5 daily or weekly habits that will help achieve the goal.

Goal: "${goal.title}"
${goal.description ? `Description: "${goal.description}"` : ''}
Duration: ${goal.duration}
${profile?.currentLevel ? `User level: ${profile.currentLevel}` : ''}
${profile?.pace ? `User pace: ${profile.pace}` : ''}
${profile?.reviewFrequency ? `Review frequency: ${profile.reviewFrequency}` : ''}

Return ONLY valid JSON with this structure:
{
  "habits": [
    { "title": "Short habit name", "description": "Brief explanation", "frequency": "daily" or "weekly" }
  ]
}`;

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error("Error generating habits:", error);
        res.status(500).json({ error: "Failed to generate habits" });
    }
};

export const createHabit = async (req, res) => {
    const { userId } = req.auth;
    const { title, description, frequency, daysOfWeek, goalId, isAIGenerated } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {},
            create: { clerkId: userId, email: `${userId}@placeholder.com` }
        });

        const habit = await prisma.habit.create({
            data: {
                userId,
                title,
                description: description || undefined,
                frequency: frequency || 'daily',
                daysOfWeek: daysOfWeek || undefined,
                goalId: goalId || undefined,
                isAIGenerated: isAIGenerated || false,
            }
        });

        res.status(201).json(habit);
    } catch (error) {
        console.error("Error creating habit:", error);
        res.status(500).json({ error: "Failed to create habit" });
    }
};

export const getUserHabits = async (req, res) => {
    const { userId } = req.auth;
    const today = todayStr();

    try {
        const habits = await prisma.habit.findMany({
            where: { userId, isArchived: false },
            include: {
                completions: {
                    where: { date: today },
                    take: 1,
                },
                goal: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        const result = habits.map(h => ({
            ...h,
            completedToday: h.completions.length > 0,
            completions: undefined,
        }));

        res.json(result);
    } catch (error) {
        console.error("Error fetching habits:", error);
        res.status(500).json({ error: "Failed to fetch habits" });
    }
};

export const getTodayHabits = async (req, res) => {
    const { userId } = req.auth;
    const today = todayStr();

    try {
        const habits = await prisma.habit.findMany({
            where: { userId, isArchived: false },
            include: {
                completions: {
                    where: { date: today },
                    take: 1,
                },
                goal: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        const todayHabits = habits
            .filter(h => isDueToday(h))
            .map(h => ({
                ...h,
                completedToday: h.completions.length > 0,
                completions: undefined,
            }));

        res.json(todayHabits);
    } catch (error) {
        console.error("Error fetching today's habits:", error);
        res.status(500).json({ error: "Failed to fetch today's habits" });
    }
};

export const completeHabit = async (req, res) => {
    const { userId } = req.auth;
    const { habitId } = req.params;
    const today = todayStr();

    try {
        const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!habit) {
            return res.status(404).json({ error: "Habit not found" });
        }

        const completion = await prisma.habitCompletion.upsert({
            where: { habitId_date: { habitId, date: today } },
            update: {},
            create: { habitId, date: today },
        });

        res.json(completion);
    } catch (error) {
        console.error("Error completing habit:", error);
        res.status(500).json({ error: "Failed to complete habit" });
    }
};

export const uncompleteHabit = async (req, res) => {
    const { userId } = req.auth;
    const { habitId } = req.params;
    const today = todayStr();

    try {
        const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!habit) {
            return res.status(404).json({ error: "Habit not found" });
        }

        await prisma.habitCompletion.deleteMany({
            where: { habitId, date: today },
        });

        res.json({ message: "Completion removed" });
    } catch (error) {
        console.error("Error uncompleting habit:", error);
        res.status(500).json({ error: "Failed to uncomplete habit" });
    }
};

export const updateHabit = async (req, res) => {
    const { userId } = req.auth;
    const { habitId } = req.params;
    const { title, description, frequency, daysOfWeek } = req.body;

    try {
        const existing = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!existing) {
            return res.status(404).json({ error: "Habit not found" });
        }

        const habit = await prisma.habit.update({
            where: { id: habitId },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(frequency !== undefined && { frequency }),
                ...(daysOfWeek !== undefined && { daysOfWeek }),
            },
        });

        res.json(habit);
    } catch (error) {
        console.error("Error updating habit:", error);
        res.status(500).json({ error: "Failed to update habit" });
    }
};

export const deleteHabit = async (req, res) => {
    const { userId } = req.auth;
    const { habitId } = req.params;

    try {
        const existing = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!existing) {
            return res.status(404).json({ error: "Habit not found" });
        }

        await prisma.habit.delete({ where: { id: habitId } });
        res.json({ message: "Habit deleted" });
    } catch (error) {
        console.error("Error deleting habit:", error);
        res.status(500).json({ error: "Failed to delete habit" });
    }
};

export const getStreaks = async (req, res) => {
    const { userId } = req.auth;

    try {
        const habits = await prisma.habit.findMany({
            where: { userId, isArchived: false },
            select: { id: true },
        });

        if (habits.length === 0) {
            return res.json({ currentStreak: 0, longestStreak: 0 });
        }

        const habitIds = habits.map(h => h.id);

        // Get all completions grouped by date, last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const completions = await prisma.habitCompletion.findMany({
            where: {
                habitId: { in: habitIds },
                completedAt: { gte: ninetyDaysAgo },
            },
            select: { date: true },
        });

        // Get unique dates with at least one completion
        const completedDates = [...new Set(completions.map(c => c.date))].sort().reverse();

        // Calculate current streak (consecutive days ending today or yesterday)
        let currentStreak = 0;
        const today = todayStr();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let checkDate = completedDates.includes(today) ? today : (completedDates.includes(yesterdayStr) ? yesterdayStr : null);

        if (checkDate) {
            const dateSet = new Set(completedDates);
            let d = new Date(checkDate);
            while (dateSet.has(d.toISOString().split('T')[0])) {
                currentStreak++;
                d.setDate(d.getDate() - 1);
            }
        }

        // Calculate longest streak
        const sortedDates = [...new Set(completions.map(c => c.date))].sort();
        let longestStreak = 0;
        let streak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                streak++;
            } else {
                longestStreak = Math.max(longestStreak, streak);
                streak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, streak);

        if (sortedDates.length === 0) longestStreak = 0;

        res.json({ currentStreak, longestStreak });
    } catch (error) {
        console.error("Error fetching streaks:", error);
        res.status(500).json({ error: "Failed to fetch streaks" });
    }
};

export const getHabitStats = async (req, res) => {
    const { userId } = req.auth;

    try {
        const habits = await prisma.habit.findMany({
            where: { userId, isArchived: false },
            select: { id: true, title: true, frequency: true },
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const completions = await prisma.habitCompletion.findMany({
            where: {
                habitId: { in: habits.map(h => h.id) },
                completedAt: { gte: sevenDaysAgo },
            },
            select: { habitId: true, date: true },
        });

        const stats = habits.map(habit => {
            const habitCompletions = completions.filter(c => c.habitId === habit.id);
            const expectedDays = habit.frequency === 'daily' ? 7 : habit.frequency === 'weekly' ? 1 : 7;
            const completionRate = expectedDays > 0 ? Math.min(100, Math.round((habitCompletions.length / expectedDays) * 100)) : 0;

            return {
                id: habit.id,
                title: habit.title,
                completionsLast7Days: habitCompletions.length,
                completionRate,
            };
        });

        res.json(stats);
    } catch (error) {
        console.error("Error fetching habit stats:", error);
        res.status(500).json({ error: "Failed to fetch habit stats" });
    }
};
