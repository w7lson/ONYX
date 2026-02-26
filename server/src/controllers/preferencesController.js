import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const savePreferences = async (req, res) => {
    const { userId } = req.auth;
    const { currentLevel, learningStyle, preferredContent, pace, reviewFrequency, language } = req.body;

    if (!currentLevel || !learningStyle || !preferredContent || !pace || !reviewFrequency) {
        return res.status(400).json({ error: "All preference fields are required" });
    }

    try {
        const profile = await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {
                currentLevel,
                learningStyle,
                preferredContent,
                pace,
                reviewFrequency,
                ...(language && { language }),
                onboardingDone: true,
            },
            create: {
                clerkId: userId,
                email: `${userId}@placeholder.com`,
                currentLevel,
                learningStyle,
                preferredContent,
                pace,
                reviewFrequency,
                ...(language && { language }),
                onboardingDone: true,
            },
        });

        res.json(profile);
    } catch (error) {
        console.error("Error saving preferences:", error);
        res.status(500).json({ error: "Failed to save preferences" });
    }
};

export const updatePreferences = async (req, res) => {
    const { userId } = req.auth;
    const allowedFields = ['currentLevel', 'learningStyle', 'preferredContent', 'pace', 'reviewFrequency', 'language'];
    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
        const profile = await prisma.userProfile.update({
            where: { clerkId: userId },
            data: updates,
            select: {
                currentLevel: true,
                learningStyle: true,
                preferredContent: true,
                pace: true,
                reviewFrequency: true,
                language: true,
                onboardingDone: true,
            },
        });

        res.json(profile);
    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ error: "Failed to update preferences" });
    }
};

export const getPreferences = async (req, res) => {
    const { userId } = req.auth;

    try {
        const profile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
            select: {
                currentLevel: true,
                learningStyle: true,
                preferredContent: true,
                pace: true,
                reviewFrequency: true,
                language: true,
                onboardingDone: true,
                welcomeGuideCompleted: true,
            },
        });

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.json(profile);
    } catch (error) {
        console.error("Error fetching preferences:", error);
        res.status(500).json({ error: "Failed to fetch preferences" });
    }
};

export const getWelcomeGuideStatus = async (req, res) => {
    const { userId } = req.auth;

    try {
        const profile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
            select: { welcomeGuideCompleted: true },
        });

        if (profile?.welcomeGuideCompleted) {
            return res.json({ completed: true, tasks: {} });
        }

        const [goalCount, habitCount, planCount] = await Promise.all([
            prisma.goal.count({ where: { userId } }),
            prisma.habit.count({ where: { userId, isArchived: false } }),
            prisma.learningPlan.count({ where: { userId } }),
        ]);

        res.json({
            completed: false,
            tasks: {
                hasGoal: goalCount > 0,
                hasHabit: habitCount > 0,
                hasPlan: planCount > 0,
            },
        });
    } catch (error) {
        console.error("Error fetching welcome guide status:", error);
        res.status(500).json({ error: "Failed to fetch welcome guide status" });
    }
};

export const completeWelcomeGuide = async (req, res) => {
    const { userId } = req.auth;

    try {
        await prisma.userProfile.update({
            where: { clerkId: userId },
            data: { welcomeGuideCompleted: true },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error completing welcome guide:", error);
        res.status(500).json({ error: "Failed to complete welcome guide" });
    }
};
