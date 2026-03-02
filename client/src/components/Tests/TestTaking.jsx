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
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('tests.backToTests')}
            </button>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">
                        {t('tests.questionOf', { current: currentIndex + 1, total: questions.length })}
                    </span>
                    <span className="text-sm font-medium text-slate-300">{test.topic}</span>
                </div>
                <div className="h-2 bg-white/[0.08] rounded-full">
                    <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-6 mb-6">
                <p className="text-lg font-semibold text-slate-100 mb-6">
                    {currentQ.questionText}
                </p>

                {currentQ.options && (
                    <div className="space-y-3">
                        {Object.entries(currentQ.options).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setAnswer(currentQ.id, key)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                    answers[currentQ.id] === key
                                        ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                                        : 'border-white/[0.08] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
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
                    className="px-4 py-2 bg-white/[0.06] text-slate-300 rounded-md font-medium hover:bg-white/[0.10] transition-colors disabled:opacity-40"
                >
                    {t('tests.previous')}
                </button>

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        {t('tests.next')}
                    </button>
                ) : (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-4 py-2 bg-success-600 text-white rounded-md font-medium hover:bg-success-700 transition-colors"
                    >
                        {t('tests.submitTest')}
                    </button>
                )}
            </div>

            {/* Confirm modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#161A22] border border-white/[0.08] rounded-lg p-6 max-w-sm w-full shadow-xl">
                        <p className="text-slate-100 mb-4">{t('tests.confirmSubmit')}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-white/[0.06] text-slate-300 rounded-md font-medium hover:bg-white/[0.10] transition-colors"
                            >
                                {t('tests.cancel')}
                            </button>
                            <button
                                onClick={() => { setShowConfirm(false); handleSubmit(); }}
                                className="px-4 py-2 bg-success-600 text-white rounded-md font-medium hover:bg-success-700 transition-colors"
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
