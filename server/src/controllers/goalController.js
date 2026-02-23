import { PrismaClient } from '@prisma/client';
import { createNotification } from './notificationController.js';

const prisma = new PrismaClient();

export const createGoal = async (req, res) => {
    const { userId } = req.auth;
    const { title, description, focus, duration, reward, targetDate, milestones } = req.body;

    if (!title || !duration) {
        return res.status(400).json({ error: "Title and duration are required" });
    }

    try {
        await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {},
            create: { clerkId: userId, email: `${userId}@placeholder.com` }
        });

        const goal = await prisma.goal.create({
            data: {
                userId,
                title,
                description: description || undefined,
                focus: focus || "Uncategorized",
                duration,
                reward: reward || undefined,
                targetDate: targetDate ? new Date(targetDate) : undefined,
                status: "active",
                milestones: {
                    create: (milestones || []).map((m, i) => ({
                        title: m.title,
                        description: m.description || undefined,
                        reward: m.reward || undefined,
                        targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
                        order: m.order ?? i,
                    }))
                }
            },
            include: { milestones: { orderBy: { order: 'asc' } } }
        });

        res.status(201).json(goal);
    } catch (error) {
        console.error("Error creating goal:", error);
        res.status(500).json({ error: "Failed to create goal" });
    }
};

export const getUserGoals = async (req, res) => {
    const { userId } = req.auth;

    try {
        const goals = await prisma.goal.findMany({
            where: { userId },
            include: { milestones: { orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(goals);
    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).json({ error: "Failed to fetch goals" });
    }
};

export const getGoal = async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;

    try {
        const goal = await prisma.goal.findFirst({
            where: { id: goalId, userId },
            include: { milestones: { orderBy: { order: 'asc' } } }
        });

        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }

        res.json(goal);
    } catch (error) {
        console.error("Error fetching goal:", error);
        res.status(500).json({ error: "Failed to fetch goal" });
    }
};

export const updateGoal = async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;
    const { title, description, focus, duration, reward, targetDate, status, failureReason, failureLesson } = req.body;

    try {
        const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
        if (!existing) {
            return res.status(404).json({ error: "Goal not found" });
        }

        const goal = await prisma.goal.update({
            where: { id: goalId },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(focus !== undefined && { focus }),
                ...(duration !== undefined && { duration }),
                ...(reward !== undefined && { reward }),
                ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
                ...(status !== undefined && { status }),
                ...(failureReason !== undefined && { failureReason }),
                ...(failureLesson !== undefined && { failureLesson }),
            },
            include: { milestones: { orderBy: { order: 'asc' } } }
        });

        if (status === 'completed' && existing.status !== 'completed') {
            createNotification(userId, {
                type: 'goal_complete',
                title: 'Goal completed!',
                message: `You completed "${goal.title}". Great job!`,
                link: '/goals',
            }).catch(e => console.error('Goal notification error:', e));
        }

        if (status === 'failed' && existing.status !== 'failed') {
            createNotification(userId, {
                type: 'goal_failed',
                title: 'Goal marked as failed',
                message: `You marked "${goal.title}" as failed. Reflect and try again!`,
                link: '/goals',
            }).catch(e => console.error('Goal notification error:', e));
        }

        res.json(goal);
    } catch (error) {
        console.error("Error updating goal:", error);
        res.status(500).json({ error: "Failed to update goal" });
    }
};

export const deleteGoal = async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;

    try {
        const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
        if (!existing) {
            return res.status(404).json({ error: "Goal not found" });
        }

        await prisma.goal.delete({ where: { id: goalId } });
        res.json({ message: "Goal deleted" });
    } catch (error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ error: "Failed to delete goal" });
    }
};

export const updateMilestones = async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;
    const { milestones } = req.body;

    if (!Array.isArray(milestones)) {
        return res.status(400).json({ error: "Milestones array is required" });
    }

    try {
        const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
        if (!existing) {
            return res.status(404).json({ error: "Goal not found" });
        }

        await prisma.$transaction([
            prisma.milestone.deleteMany({ where: { goalId } }),
            ...milestones.map((m, i) =>
                prisma.milestone.create({
                    data: {
                        goalId,
                        title: m.title,
                        description: m.description || undefined,
                        reward: m.reward || undefined,
                        targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
                        order: m.order ?? i,
                        isCompleted: m.isCompleted || false,
                    }
                })
            )
        ]);

        const goal = await prisma.goal.findFirst({
            where: { id: goalId },
            include: { milestones: { orderBy: { order: 'asc' } } }
        });

        res.json(goal);
    } catch (error) {
        console.error("Error updating milestones:", error);
        res.status(500).json({ error: "Failed to update milestones" });
    }
};

export const toggleMilestone = async (req, res) => {
    const { userId } = req.auth;
    const { milestoneId } = req.params;

    try {
        const milestone = await prisma.milestone.findFirst({
            where: { id: milestoneId },
            include: { goal: true }
        });

        if (!milestone || milestone.goal.userId !== userId) {
            return res.status(404).json({ error: "Milestone not found" });
        }

        const updated = await prisma.milestone.update({
            where: { id: milestoneId },
            data: { isCompleted: !milestone.isCompleted }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error toggling milestone:", error);
        res.status(500).json({ error: "Failed to toggle milestone" });
    }
};
