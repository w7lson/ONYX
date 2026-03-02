import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const savePreferences = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { currentLevel, learningStyle, preferredContent, pace, reviewFrequency, language } = req.body;

    if (!currentLevel || !learningStyle || !preferredContent || !pace || !reviewFrequency) {
        return res.status(400).json({ error: "All preference fields are required" });
    }

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
});

export const updatePreferences = asyncHandler(async (req, res) => {
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
});

export const getPreferences = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

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
});

export const getWelcomeGuideStatus = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    const profile = await prisma.userProfile.findUnique({
        where: { clerkId: userId },
        select: { welcomeGuideCompleted: true, currentLevel: true },
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
            hasPreferences: !!profile?.currentLevel,
            hasGoal: goalCount > 0,
            hasHabit: habitCount > 0,
            hasPlan: planCount > 0,
        },
    });
});

export const completeWelcomeGuide = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    await prisma.userProfile.update({
        where: { clerkId: userId },
        data: { welcomeGuideCompleted: true },
    });

    res.json({ success: true });
});
