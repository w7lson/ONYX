import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createNotification } from './notificationController.js';

export const createGoal = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { title, description, focus, duration, reward, targetDate, milestones } = req.body;

    if (!title || !duration) {
        return res.status(400).json({ error: "Title and duration are required" });
    }

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
});

export const getUserGoals = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    const goals = await prisma.goal.findMany({
        where: { userId },
        include: { milestones: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' }
    });

    res.json(goals);
});

export const getGoal = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;

    const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId },
        include: { milestones: { orderBy: { order: 'asc' } } }
    });

    if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
    }

    res.json(goal);
});

export const updateGoal = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;
    const { title, description, focus, duration, reward, targetDate, status, failureReason, failureLesson } = req.body;

    const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!existing) {
        return res.status(404).json({ error: "Goal not found" });
    }

    const updateData = {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(focus !== undefined && { focus }),
        ...(duration !== undefined && { duration }),
        ...(reward !== undefined && { reward }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(status !== undefined && { status }),
        ...(failureReason !== undefined && { failureReason }),
        ...(failureLesson !== undefined && { failureLesson }),
    };

    // When reactivating, clear failure fields
    if (status === 'active' && (existing.status === 'failed' || existing.status === 'completed')) {
        updateData.failureReason = null;
        updateData.failureLesson = null;
    }

    const goal = await prisma.goal.update({
        where: { id: goalId },
        data: updateData,
        include: { milestones: { orderBy: { order: 'asc' } } }
    });

    // Sync linked plan status with goal status
    if (status !== undefined && status !== existing.status) {
        await prisma.learningPlan.updateMany({
            where: { goalId },
            data: { status },
        });
    }

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
});

export const deleteGoal = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;

    const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!existing) {
        return res.status(404).json({ error: "Goal not found" });
    }

    await prisma.goal.delete({ where: { id: goalId } });
    res.json({ message: "Goal deleted" });
});

export const updateMilestones = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { goalId } = req.params;
    const { milestones } = req.body;

    if (!Array.isArray(milestones)) {
        return res.status(400).json({ error: "Milestones array is required" });
    }

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
});

export const toggleMilestone = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { milestoneId } = req.params;

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
});
