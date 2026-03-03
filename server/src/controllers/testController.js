import OpenAI from 'openai';
import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createNotification } from './notificationController.js';

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

export const generateTest = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { topic, content, questionCount = 10 } = req.body;

    if (!topic && !content) {
        return res.status(400).json({ error: "Topic or content is required" });
    }

    await prisma.userProfile.upsert({
        where: { clerkId: userId },
        update: {},
        create: { clerkId: userId, email: `${userId}@placeholder.com` },
    });

    const sourceText = content
        ? `Based on the following study material:\n\n${content}\n\nGenerate`
        : `Generate`;

    const prompt = `${sourceText} a multiple choice test on "${topic || 'the provided material'}" with ${questionCount} questions.

Each question must have 4 options (a, b, c, d) and indicate the correct answer letter.

Return valid JSON:
{
    "questions": [
        {
            "type": "mc",
            "questionText": "...",
            "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
            "correctAnswer": "b"
        }
    ]
}`;

    const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: "You are a test generator for educational purposes. Create clear, fair questions that test understanding." },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const questions = parsed.questions || [];

    const test = await prisma.test.create({
        data: {
            userId,
            topic: topic || 'Custom material',
            questions: {
                create: questions.map(q => ({
                    type: 'mc',
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                }))
            }
        },
        include: { questions: true }
    });

    // Strip correct answers so user can't cheat
    const sanitized = {
        ...test,
        questions: test.questions.map(q => ({
            id: q.id,
            type: q.type,
            questionText: q.questionText,
            options: q.options,
        }))
    };

    res.json(sanitized);
});

export const submitTest = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { testId } = req.params;
    const { answers } = req.body; // [{ questionId, userAnswer }]

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Answers array is required" });
    }

    const test = await prisma.test.findFirst({
        where: { id: testId, userId },
        include: { questions: true }
    });

    if (!test) {
        return res.status(404).json({ error: "Test not found" });
    }

    let correctCount = 0;

    for (const answer of answers) {
        const question = test.questions.find(q => q.id === answer.questionId);
        if (!question) continue;

        const isCorrect = answer.userAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
        if (isCorrect) correctCount++;

        await prisma.testQuestion.update({
            where: { id: question.id },
            data: {
                userAnswer: answer.userAnswer,
                isCorrect,
            }
        });
    }

    const score = test.questions.length > 0
        ? Math.round((correctCount / test.questions.length) * 100)
        : 0;

    const isFirstAttempt = !test.completedAt;

    await prisma.testAttempt.create({ data: { testId, score } });

    const updatedTest = await prisma.test.update({
        where: { id: testId },
        data: { score, completedAt: new Date() },
        include: { questions: true, attempts: { orderBy: { completedAt: 'asc' } } }
    });

    if (isFirstAttempt) {
        createNotification(userId, {
            type: 'test_result',
            title: `Test completed: ${score}%`,
            message: `You scored ${score}% on "${test.topic}".`,
            link: '/tests',
        }).catch(e => console.error('Test notification error:', e));
    }

    res.json(updatedTest);
});

export const getUserTests = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    const tests = await prisma.test.findMany({
        where: { userId },
        include: {
            questions: {
                select: { id: true, type: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(tests);
});

export const getTest = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { testId } = req.params;

    const test = await prisma.test.findFirst({
        where: { id: testId, userId },
        include: { questions: true, attempts: { orderBy: { completedAt: 'asc' } } }
    });

    if (!test) {
        return res.status(404).json({ error: "Test not found" });
    }

    // If test is not completed, strip correct answers
    if (!test.completedAt) {
        test.questions = test.questions.map(q => ({
            id: q.id,
            type: q.type,
            questionText: q.questionText,
            options: q.options,
            userAnswer: q.userAnswer,
        }));
    }

    res.json(test);
});

export const deleteTest = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const { testId } = req.params;

    const test = await prisma.test.findFirst({
        where: { id: testId, userId },
    });

    if (!test) {
        return res.status(404).json({ error: "Test not found" });
    }

    await prisma.test.delete({
        where: { id: testId },
    });

    res.json({ message: "Test deleted successfully" });
});
