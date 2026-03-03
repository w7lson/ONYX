import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function TestResults({ test, onBack, onRetake }) {
    const { t } = useTranslation();

    const questions = test.questions || [];
    const attempts = test.attempts || [];
    const scoreColor = test.score >= 80
        ? 'text-green-400'
        : test.score >= 60
            ? 'text-yellow-400'
            : 'text-red-400';

    const scoreBadge = (score) => {
        if (score >= 80) return 'bg-green-500/20 text-green-400';
        if (score >= 60) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('tests.backToTests')}
            </button>

            {/* Score header */}
            <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-6 mb-6 text-center">
                <h2 className="text-lg font-semibold text-slate-100 mb-2">{t('tests.results')}</h2>
                <p className="text-sm text-slate-400 mb-4">{test.topic}</p>
                <div className={`text-5xl font-bold ${scoreColor}`}>
                    {test.score}%
                </div>
                <p className="text-sm text-slate-400 mt-2">
                    {questions.filter(q => q.isCorrect).length} / {questions.length} {t('tests.correct').toLowerCase()}
                </p>

                {/* Retake button */}
                {onRetake && (
                    <button
                        onClick={onRetake}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        <RotateCcw size={15} />
                        {t('tests.retakeTest')}
                    </button>
                )}
            </div>

            {/* Attempt history */}
            {attempts.length > 0 && (
                <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-5 mb-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('tests.attemptHistory')}</h3>
                    <div className="space-y-2">
                        {attempts.map((attempt, i) => (
                            <div key={attempt.id} className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">{t('tests.attempt', { n: i + 1 })}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-500 text-xs">
                                        {new Date(attempt.completedAt).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreBadge(attempt.score)}`}>
                                        {attempt.score}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Question review */}
            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div
                        key={q.id}
                        className={`bg-[#161A22] rounded-lg border p-5 ${
                            q.isCorrect
                                ? 'border-green-500/30'
                                : 'border-red-500/30'
                        }`}
                    >
                        <div className="flex items-start gap-3 mb-3">
                            {q.isCorrect ? (
                                <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                            ) : (
                                <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            )}
                            <p className="font-medium text-slate-100">
                                {i + 1}. {q.questionText}
                            </p>
                        </div>

                        <div className="ml-8 space-y-2">
                            {/* User's answer */}
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">
                                    {t('tests.yourAnswer')}
                                </span>
                                <p className={`text-sm mt-0.5 ${
                                    q.isCorrect ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {`${(q.userAnswer || '').toUpperCase()}. ${q.options?.[q.userAnswer] || q.userAnswer || '—'}`}
                                </p>
                            </div>

                            {/* Correct answer */}
                            {!q.isCorrect && (
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase">
                                        {t('tests.correctAnswer')}
                                    </span>
                                    <p className="text-sm text-green-400 mt-0.5">
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
