import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function TestResults({ test, onBack }) {
    const { t } = useTranslation();

    const questions = test.questions || [];
    const scoreColor = test.score >= 80
        ? 'text-green-600 dark:text-green-400'
        : test.score >= 60
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-red-600 dark:text-red-400';

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('tests.backToTests')}
            </button>

            {/* Score header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 text-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('tests.results')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{test.topic}</p>
                <div className={`text-5xl font-bold ${scoreColor}`}>
                    {test.score}%
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {questions.filter(q => q.isCorrect).length} / {questions.length} {t('tests.correct').toLowerCase()}
                </p>
            </div>

            {/* Question review */}
            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div
                        key={q.id}
                        className={`bg-white dark:bg-gray-900 rounded-xl border p-5 ${
                            q.isCorrect
                                ? 'border-green-200 dark:border-green-800'
                                : 'border-red-200 dark:border-red-800'
                        }`}
                    >
                        <div className="flex items-start gap-3 mb-3">
                            {q.isCorrect ? (
                                <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                            ) : (
                                <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            )}
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                {i + 1}. {q.questionText}
                            </p>
                        </div>

                        <div className="ml-8 space-y-2">
                            {/* User's answer */}
                            <div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    {t('tests.yourAnswer')}
                                </span>
                                <p className={`text-sm mt-0.5 ${
                                    q.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                }`}>
                                    {`${(q.userAnswer || '').toUpperCase()}. ${q.options?.[q.userAnswer] || q.userAnswer || '—'}`}
                                </p>
                            </div>

                            {/* Correct answer */}
                            {!q.isCorrect && (
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        {t('tests.correctAnswer')}
                                    </span>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                                        {`${(q.correctAnswer || '').toUpperCase()}. ${q.options?.[q.correctAnswer] || q.correctAnswer}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
