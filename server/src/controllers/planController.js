import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { createNotification } from './notificationController.js';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// Toggle task completion
export const toggleTask = async (req, res) => {
    const { userId } = req.auth;
    const { taskId } = req.params;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { module: { include: { plan: true } } },
        });

        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (task.module.plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const updated = await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted: !task.isCompleted },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ error: 'Failed to toggle task' });
    }
};

// Get all plans for user
export const getUserPlans = async (req, res) => {
    const { userId } = req.auth;

    try {
        const plans = await prisma.learningPlan.findMany({
            where: { userId },
            include: {
                goal: { select: { id: true, title: true, focus: true, status: true } },
                modules: {
                    orderBy: { order: 'asc' },
                    include: { tasks: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).json({ error: "Failed to fetch plans" });
    }
};

// Generate plan from active goal (returns JSON, does NOT save)
export const generatePlanFromGoal = async (req, res) => {
    const { userId } = req.auth;
    const { goalId, customInstructions } = req.body;

    if (!goalId) {
        return res.status(400).json({ error: "goalId is required" });
    }

    try {
        // Fetch active goal with milestones
        const goal = await prisma.goal.findFirst({
            where: { id: goalId, userId, status: 'active' },
            include: { milestones: { orderBy: { order: 'asc' } } }
        });

        if (!goal) {
            return res.status(404).json({ error: "Active goal not found" });
        }

        // Fetch user preferences
        const profile = await prisma.userProfile.findUnique({
            where: { clerkId: userId },
            select: {
                primaryGoal: true,
                currentLevel: true,
                learningStyle: true,
                preferredContent: true,
                pace: true,
                reviewFrequency: true,
            }
        });

        // Build milestones text
        const milestonesText = goal.milestones.length > 0
            ? goal.milestones.map((m, i) =>
                `${i + 1}. ${m.title}${m.description ? ` — ${m.description}` : ''}${m.targetDate ? ` (target: ${new Date(m.targetDate).toLocaleDateString()})` : ''}`
            ).join('\n')
            : 'No milestones set yet.';

        const prompt = `
You are an expert life coach and strategist. Create a structured, actionable plan to help a user achieve their goal.

**Goal:** "${goal.title}"
${goal.description ? `**Description:** "${goal.description}"` : ''}
**Focus Area:** ${goal.focus}
**Timeline:** ${goal.duration}
${goal.targetDate ? `**Target Date:** ${new Date(goal.targetDate).toLocaleDateString()}` : ''}
${goal.reward ? `**Reward:** ${goal.reward}` : ''}

**Existing Milestones:**
${milestonesText}

**User Profile:**
- Primary motivation: ${profile?.primaryGoal || 'not specified'}
- Available daily time: ${profile?.currentLevel || 'not specified'}
- Learning style: ${profile?.learningStyle || 'not specified'}
- Preferred content: ${profile?.preferredContent || 'not specified'}
- Pace preference: ${profile?.pace || 'not specified'}
- Review frequency: ${profile?.reviewFrequency || 'not specified'}

${customInstructions ? `**Additional instructions from user:** ${customInstructions}` : ''}

Create a plan broken into modules (phases/stages). Each module should have:
- A clear title describing the phase
- Estimated time in minutes per session for that phase
- Concrete actionable tasks (daily activities, resources, exercises, milestones to hit)

Rules:
1. Align with the user's existing milestones where applicable
2. Suggest practical daily/weekly activities
3. Respect the user's available time and pace preference
4. Be realistic for the goal's timeline
5. Maximum 8 modules, maximum 8 tasks per module
6. Each task should have a type: "action" (something to do), "milestone" (checkpoint to reach), "habit" (recurring activity), or "resource" (something to learn/read/watch)

You may also suggest 2-4 habits that would help the user stay on track.

Return strictly valid JSON with this structure:
{
    "title": "Plan title",
    "description": "Brief plan overview (1-2 sentences)",
    "modules": [
        {
            "title": "Phase/Module title",
            "estimatedMinutes": 30,
            "tasks": [
                { "content": "Specific actionable task", "type": "action" }
            ]
        }
    ],
    "suggestedHabits": [
        { "title": "Habit name", "description": "Why this helps", "frequency": "daily" }
    ]
}`;

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an expert life coach and strategist. You create clear, actionable plans." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const planData = JSON.parse(completion.choices[0].message.content);

        res.json({ plan: planData, goalId });

    } catch (error) {
        console.error("Error generating plan:", error);
        res.status(500).json({ error: "Failed to generate plan" });
    }
};

// Save plan (after user review/edit)
export const savePlan = async (req, res) => {
    const { userId } = req.auth;
    const { goalId, title, description, modules } = req.body;

    if (!title || !modules?.length) {
        return res.status(400).json({ error: "Title and modules are required" });
    }

    try {
        // Ensure user exists
        await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {},
            create: { clerkId: userId, email: `${userId}@placeholder.com` },
        });

        // If goalId provided and goal already has a plan, delete the old plan
        if (goalId) {
            const existingPlan = await prisma.learningPlan.findUnique({
                where: { goalId },
            });
            if (existingPlan) {
                await prisma.learningPlan.delete({ where: { id: existingPlan.id } });
            }
        }

        const savedPlan = await prisma.learningPlan.create({
            data: {
                userId,
                goalId: goalId || null,
                title,
                description: description || null,
                modules: {
                    create: modules.map((mod, index) => ({
                        title: mod.title,
                        estimatedMinutes: mod.estimatedMinutes || 0,
                        order: index,
                        tasks: {
                            create: (mod.tasks || []).map(task => ({
                                content: task.content,
                                type: task.type || null,
                            }))
                        }
                    }))
                }
            },
            include: {
                goal: { select: { id: true, title: true, focus: true, status: true } },
                modules: {
                    orderBy: { order: 'asc' },
                    include: { tasks: true }
                }
            }
        });

        createNotification(userId, {
            type: 'plan_created',
            title: 'New plan created!',
            message: `Your plan "${savedPlan.title}" is ready.`,
            link: '/plans',
        }).catch(console.error);

        res.status(201).json(savedPlan);
    } catch (error) {
        console.error("Error saving plan:", error);
        res.status(500).json({ error: "Failed to save plan" });
    }
};

// Update plan title/description
export const updatePlan = async (req, res) => {
    const { userId } = req.auth;
    const { planId } = req.params;
    const { title, description } = req.body;

    try {
        const plan = await prisma.learningPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const updated = await prisma.learningPlan.update({
            where: { id: planId },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
            },
            include: {
                goal: { select: { id: true, title: true, focus: true, status: true } },
                modules: { orderBy: { order: 'asc' }, include: { tasks: true } }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating plan:", error);
        res.status(500).json({ error: "Failed to update plan" });
    }
};

// Delete plan
export const deletePlan = async (req, res) => {
    const { userId } = req.auth;
    const { planId } = req.params;

    try {
        const plan = await prisma.learningPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.learningPlan.delete({ where: { id: planId } });
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting plan:", error);
        res.status(500).json({ error: "Failed to delete plan" });
    }
};

// Add module to plan
export const addModule = async (req, res) => {
    const { userId } = req.auth;
    const { planId } = req.params;
    const { title, estimatedMinutes, tasks } = req.body;

    try {
        const plan = await prisma.learningPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        // Get max order
        const maxOrder = await prisma.module.aggregate({
            where: { planId },
            _max: { order: true }
        });

        const module = await prisma.module.create({
            data: {
                planId,
                title: title || 'New Module',
                estimatedMinutes: estimatedMinutes || 0,
                order: (maxOrder._max.order ?? -1) + 1,
                tasks: {
                    create: (tasks || []).map(task => ({
                        content: task.content,
                        type: task.type || null,
                    }))
                }
            },
            include: { tasks: true }
        });

        res.status(201).json(module);
    } catch (error) {
        console.error("Error adding module:", error);
        res.status(500).json({ error: "Failed to add module" });
    }
};

// Update module
export const updateModule = async (req, res) => {
    const { userId } = req.auth;
    const { moduleId } = req.params;
    const { title, estimatedMinutes } = req.body;

    try {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { plan: true }
        });
        if (!module) return res.status(404).json({ error: 'Module not found' });
        if (module.plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const updated = await prisma.module.update({
            where: { id: moduleId },
            data: {
                ...(title !== undefined && { title }),
                ...(estimatedMinutes !== undefined && { estimatedMinutes }),
            },
            include: { tasks: true }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating module:", error);
        res.status(500).json({ error: "Failed to update module" });
    }
};

// Delete module
export const deleteModule = async (req, res) => {
    const { userId } = req.auth;
    const { moduleId } = req.params;

    try {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { plan: true }
        });
        if (!module) return res.status(404).json({ error: 'Module not found' });
        if (module.plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.module.delete({ where: { id: moduleId } });
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting module:", error);
        res.status(500).json({ error: "Failed to delete module" });
    }
};

// Reorder modules
export const reorderModules = async (req, res) => {
    const { userId } = req.auth;
    const { planId } = req.params;
    const { moduleOrder } = req.body; // [{ id, order }]

    try {
        const plan = await prisma.learningPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.$transaction(
            moduleOrder.map(({ id, order }) =>
                prisma.module.update({ where: { id }, data: { order } })
            )
        );

        const updated = await prisma.learningPlan.findUnique({
            where: { id: planId },
            include: {
                goal: { select: { id: true, title: true, focus: true, status: true } },
                modules: { orderBy: { order: 'asc' }, include: { tasks: true } }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error reordering modules:", error);
        res.status(500).json({ error: "Failed to reorder modules" });
    }
};

// Add task to module
export const addTask = async (req, res) => {
    const { userId } = req.auth;
    const { moduleId } = req.params;
    const { content, type } = req.body;

    try {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { plan: true }
        });
        if (!module) return res.status(404).json({ error: 'Module not found' });
        if (module.plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const task = await prisma.task.create({
            data: {
                moduleId,
                content: content || 'New task',
                type: type || null,
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ error: "Failed to add task" });
    }
};

// Update task
export const updateTask = async (req, res) => {
    const { userId } = req.auth;
    const { taskId } = req.params;
    const { content, type } = req.body;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { module: { include: { plan: true } } }
        });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (task.module.plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const updated = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...(content !== undefined && { content }),
                ...(type !== undefined && { type }),
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
};

// Delete task
export const deleteTask = async (req, res) => {
    const { userId } = req.auth;
    const { taskId } = req.params;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { module: { include: { plan: true } } }
        });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (task.module.plan.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.task.delete({ where: { id: taskId } });
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
};
