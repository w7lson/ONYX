import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function TestTaking({ test, onSubmit, onBack }) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);

    const questions = test.questions || [];
    const currentQ = questions[currentIndex];

    const setAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        const formatted = questions.map(q => ({
            questionId: q.id,
            userAnswer: answers[q.id] || '',
        }));
        onSubmit(formatted);
    };

    if (!currentQ) return null;

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('tests.backToTests')}
            </button>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('tests.questionOf', { current: currentIndex + 1, total: questions.length })}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{test.topic}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                    {currentQ.questionText}
                </p>

                {currentQ.options && (
                    <div className="space-y-3">
                        {Object.entries(currentQ.options).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setAnswer(currentQ.id, key)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                                    answers[currentQ.id] === key
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <span className="font-semibold mr-2">{key.toUpperCase()}.</span>
                                {value}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
                >
                    {t('tests.previous')}
                </button>

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        {t('tests.next')}
                    </button>
                ) : (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        {t('tests.submitTest')}
                    </button>
                )}
            </div>

            {/* Confirm modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full shadow-xl">
                        <p className="text-gray-800 dark:text-gray-100 mb-4">{t('tests.confirmSubmit')}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('tests.cancel')}
                            </button>
                            <button
                                onClick={() => { setShowConfirm(false); handleSubmit(); }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                {t('tests.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
