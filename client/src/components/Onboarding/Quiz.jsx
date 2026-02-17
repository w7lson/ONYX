import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const questions = [
    {
        id: 'time',
        question: "How much time can you dedicate daily?",
        options: [
            { label: "15-30 mins", value: "short" },
            { label: "1 hour", value: "medium" },
            { label: "2+ hours", value: "long" }
        ]
    },
    {
        id: 'complexity',
        question: "What is your preferred material complexity?",
        options: [
            { label: "Beginner / Simple", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced / Technical", value: "advanced" }
        ]
    },
    {
        id: 'priority',
        question: "What is your top priority?",
        options: [
            { label: "Retention (Long term memory)", value: "retention" },
            { label: "Speed (Cramming)", value: "speed" },
            { label: "Understanding Concepts", value: "concepts" }
        ]
    }
];

export default function Quiz() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    const handleOptionSelect = (option) => {
        setAnswers({ ...answers, [questions[currentStep].id]: option.value });
    };

    const handleNext = async () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Submit Quiz
            setIsSubmitting(true);
            try {
                const token = await getToken();
                console.log("Submitting with token:", token ? "Present" : "Missing");
                const response = await axios.post('/api/plans/generate', answers, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Plan generated:", response.data);
                navigate('/dashboard');
            } catch (error) {
                console.error("Failed to submit quiz", error);
                alert("Failed to generate plan. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const currentQuestion = questions[currentStep];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="h-2 bg-gray-200 rounded-full">
                    <motion.div
                        className="h-full bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">{currentQuestion.question}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleOptionSelect(option)}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${answers[currentQuestion.id] === option.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNext}
                            disabled={!answers[currentQuestion.id]}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${answers[currentQuestion.id]
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {currentStep === questions.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
