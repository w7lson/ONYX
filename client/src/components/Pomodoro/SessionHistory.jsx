import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SessionHistory({ sessions }) {
    const { t } = useTranslation();

    if (sessions.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                <Clock size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">{t('pomodoroPage.noSessions')}</p>
            </div>
        );
    }

    const today = new Date().toDateString();

    const todaySessions = sessions.filter(
        s => new Date(s.completedAt).toDateString() === today
    );

    return (
        <div>
            {todaySessions.length > 0 && (
                <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {t('pomodoroPage.today')}: {todaySessions.filter(s => s.wasCompleted).length} {t('pomodoroPage.completed').toLowerCase()}
                    </span>
                </div>
            )}
            <div className="space-y-2">
                {sessions.slice(0, 20).map((session) => (
                    <div
                        key={session.id}
                        className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3"
                    >
                        <div className="flex items-center gap-3">
                            {session.wasCompleted ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <XCircle size={16} className="text-red-400" />
                            )}
                            <div>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {session.durationMin} min
                                </span>
                                {session.label && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                        — {session.label}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-gray-400">
                            {new Date(session.completedAt).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
