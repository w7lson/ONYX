import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

export const generateTest = async (req, res) => {
    const { userId } = req.auth;
    const { topic, content, questionCount = 10, questionTypes = ['mc', 'written'] } = req.body;

    if (!topic && !content) {
        return res.status(400).json({ error: "Topic or content is required" });
    }

    try {
        await prisma.userProfile.upsert({
            where: { clerkId: userId },
            update: {},
            create: { clerkId: userId, email: `${userId}@placeholder.com` },
        });

        const sourceText = content
            ? `Based on the following study material:\n\n${content}\n\nGenerate`
            : `Generate`;

        const prompt = `${sourceText} a test on "${topic || 'the provided material'}" with ${questionCount} questions.
Question types to include: ${questionTypes.join(', ')}.

For "mc" (multiple choice): provide 4 options (a, b, c, d) and indicate the correct answer letter.
For "written": provide a detailed question that requires a paragraph answer, and provide a model correct answer.

Mix the question types roughly evenly if both are selected.

Return valid JSON:
{
    "questions": [
        {
            "type": "mc",
            "questionText": "...",
            "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
            "correctAnswer": "b"
        },
        {
            "type": "written",
            "questionText": "...",
            "correctAnswer": "Model answer text..."
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
                        type: q.type,
                        questionText: q.questionText,
                        options: q.type === 'mc' ? q.options : undefined,
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
    } catch (error) {
        console.error("Error generating test:", error);
        res.status(500).json({ error: "Failed to generate test" });
    }
};

export const submitTest = async (req, res) => {
    const { userId } = req.auth;
    const { testId } = req.params;
    const { answers } = req.body; // [{ questionId, userAnswer }]

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Answers array is required" });
    }

    try {
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

            let isCorrect = false;
            let aiFeedback = null;

            if (question.type === 'mc') {
                isCorrect = answer.userAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
            } else {
                // AI grading for written answers
                try {
                    const gradingCompletion = await openai.chat.completions.create({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: "You are a fair and helpful grader. Grade the student's answer and provide constructive feedback." },
                            {
                                role: "user",
                                content: `Grade this answer.\nQuestion: "${question.questionText}"\nModel answer: "${question.correctAnswer}"\nStudent answer: "${answer.userAnswer}"\n\nReturn valid JSON: { "isCorrect": boolean, "feedback": "explanation string" }`
                            }
                        ],
                        response_format: { type: "json_object" },
                    });

                    const grading = JSON.parse(gradingCompletion.choices[0].message.content);
                    isCorrect = grading.isCorrect;
                    aiFeedback = grading.feedback;
                } catch (gradingError) {
                    console.error("AI grading failed for question:", question.id, gradingError);
                    aiFeedback = "Grading unavailable";
                }
            }

            if (isCorrect) correctCount++;

            await prisma.testQuestion.update({
                where: { id: question.id },
                data: {
                    userAnswer: answer.userAnswer,
                    isCorrect,
                    aiFeedback,
                }
            });
        }

        const score = test.questions.length > 0
            ? Math.round((correctCount / test.questions.length) * 100)
            : 0;

        const updatedTest = await prisma.test.update({
            where: { id: testId },
            data: { score, completedAt: new Date() },
            include: { questions: true }
        });

        res.json(updatedTest);
    } catch (error) {
        console.error("Error submitting test:", error);
        res.status(500).json({ error: "Failed to submit test" });
    }
};

export const getUserTests = async (req, res) => {
    const { userId } = req.auth;

    try {
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
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({ error: "Failed to fetch tests" });
    }
};

export const getTest = async (req, res) => {
    const { userId } = req.auth;
    const { testId } = req.params;

    try {
        const test = await prisma.test.findFirst({
            where: { id: testId, userId },
            include: { questions: true }
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
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ error: "Failed to fetch test" });
    }
};
