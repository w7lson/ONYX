import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

export const getUserPlans = async (req, res) => {
    const { userId } = req.auth;

    try {
        const plans = await prisma.learningPlan.findMany({
            where: { userId },
            include: {
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

export const generatePlan = async (req, res) => {
    const { userId } = req.auth;
    const { time, complexity, priority } = req.body;

    if (!time || !complexity || !priority) {
        return res.status(400).json({ error: "Missing preferences" });
    }

    try {
        // Ensure user exists in DB (webhook may not have fired in local dev)
        await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {},
            create: {
                clerkId: userId,
                email: `${userId}@placeholder.com`,
            },
        });

        const prompt = `
        Create a structured learning plan for a user with the following preferences:
        - Daily Time Commitment: ${time}
        - Material Complexity: ${complexity}
        - Top Priority: ${priority}
        
        The plan should be for a generic "Web Development" curriculum (for demo purposes) or you can ask for a topic. 
        Actually, let's assume the user wants to learn "React & Node.js".

        Return the response in strictly valid JSON format with this structure:
        {
            "title": "String",
            "description": "String",
            "modules": [
                {
                    "title": "String",
                    "estimatedMinutes": Number,
                    "tasks": [
                        { "content": "String" }
                    ]
                }
            ]
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an expert curriculum designer." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const planData = JSON.parse(completion.choices[0].message.content);

        // Save to Database
        // 1. Create Plan
        const savedPlan = await prisma.learningPlan.create({
            data: {
                userId: userId, // This assumes our auth middleware puts the Clerk ID here. 
                // Note: We might need to ensure the user exists in our DB first (via webhook). 
                // Ideally, we look up the user by Clerk ID to get their internal DB ID if we were using Int IDs, 
                // but our schema uses String IDs that match Clerk? Let's verify schema.
                // Schema: UserProfile.clerkId is unique, UserProfile.id is uuid. 
                // LearningPlan.userId references UserProfile.clerkId. So we are good.
                title: planData.title,
                description: planData.description,
                modules: {
                    create: planData.modules.map((mod, index) => ({
                        title: mod.title,
                        estimatedMinutes: mod.estimatedMinutes,
                        order: index,
                        tasks: {
                            create: mod.tasks.map(task => ({
                                content: task.content
                            }))
                        }
                    }))
                }
            },
            include: {
                modules: {
                    include: {
                        tasks: true
                    }
                }
            }
        });

        res.json(savedPlan);

    } catch (error) {
        console.error("Error generating plan:", error);
        res.status(500).json({ error: "Failed to generate plan" });
    }
}
