import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function TestResults({ test, onBack }) {
    const { t } = useTranslation();

    const questions = test.questions || [];
    const scoreColor = test.score >= 80
        ? 'text-green-400'
        : test.score >= 60
            ? 'text-yellow-400'
            : 'text-red-400';

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
            </div>

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
