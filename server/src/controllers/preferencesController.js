import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const savePreferences = async (req, res) => {
    const { userId } = req.auth;
    const { primaryGoal, currentLevel, learningStyle, preferredContent, pace, reviewFrequency } = req.body;

    if (!primaryGoal || !currentLevel || !learningStyle || !preferredContent || !pace || !reviewFrequency) {
        return res.status(400).json({ error: "All preference fields are required" });
    }

    try {
        const profile = await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {
                primaryGoal,
                currentLevel,
                learningStyle,
                preferredContent,
                pace,
                reviewFrequency,
                onboardingDone: true,
            },
            create: {
                clerkId: userId,
                email: `${userId}@placeholder.com`,
                primaryGoal,
                currentLevel,
                learningStyle,
                preferredContent,
                pace,
                reviewFrequency,
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
    const allowedFields = ['primaryGoal', 'currentLevel', 'learningStyle', 'preferredContent', 'pace', 'reviewFrequency'];
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
                primaryGoal: true,
                currentLevel: true,
                learningStyle: true,
                preferredContent: true,
                pace: true,
                reviewFrequency: true,
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
                primaryGoal: true,
                currentLevel: true,
                learningStyle: true,
                preferredContent: true,
                pace: true,
                reviewFrequency: true,
                onboardingDone: true,
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
