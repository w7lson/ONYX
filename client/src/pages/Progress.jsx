import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Timer, FileText, Layers, Target } from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

/* Chart tooltip style — adapts to theme */
const tooltipStyle = {
    backgroundColor: 'var(--color-slate-900, #0F172A)',
    border: 'none',
    borderRadius: '10px',
    color: '#F8FAFC',
    fontSize: 13,
};

export default function Progress() {
    const { getToken } = useAuth();
    const { t } = useTranslation();

    const [overview, setOverview] = useState(null);
    const [weeklyActivity, setWeeklyActivity] = useState([]);
    const [studyTime, setStudyTime] = useState([]);
    const [testScores, setTestScores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const [overviewRes, weeklyRes, studyRes, scoresRes] = await Promise.all([
                fetch('/api/progress/overview', { headers }),
                fetch('/api/progress/weekly-activity', { headers }),
                fetch('/api/progress/study-time', { headers }),
                fetch('/api/progress/test-scores', { headers }),
            ]);
            if (overviewRes.ok) setOverview(await overviewRes.json());
            if (weeklyRes.ok)   setWeeklyActivity(await weeklyRes.json());
            if (studyRes.ok)    setStudyTime(await studyRes.json());
            if (scoresRes.ok)   setTestScores(await scoresRes.json());
        } catch (error) {
            console.error('Error fetching progress data:', error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const formatMinutes = (min) => {
        if (min >= 60) return `${Math.round(min / 60)}h ${min % 60}m`;
        return `${min}m`;
    };

    if (loading) {
        return (
            <div>
                <p className="text-slate-500 dark:text-slate-400">{t('dashboard.loading')}</p>
            </div>
        );
    }

    const hasData = overview && (
        overview.pomodoro.totalSessions > 0 ||
        overview.tests.totalTaken > 0 ||
        overview.flashcards.totalReviews > 0 ||
        overview.goals.total > 0
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-slate-100 tracking-tight">
                {t('progress.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t('progress.subtitle')}</p>

            {!hasData ? (
                <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-10 text-center">
                    <p className="text-slate-500 dark:text-slate-400">{t('progress.noData')}</p>
                </div>
            ) : (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {[
                            { icon: Timer,     color: 'primary', value: formatMinutes(overview.pomodoro.totalMinutes),                    label: t('progress.totalStudyTime') },
                            { icon: FileText,  color: 'success', value: overview.tests.totalTaken > 0 ? `${overview.tests.avgScore}%` : '—', label: t('progress.testsAvgScore') },
                            { icon: Layers,    color: 'info',    value: overview.flashcards.totalReviews,                                 label: t('progress.flashcardReviews') },
                            { icon: Target,    color: 'warning', value: `${overview.goals.completed}/${overview.goals.total}`,             label: t('progress.goalsCompleted') },
                        ].map(({ icon: Icon, color, value, label }) => {
                            const colorMap = {
                                primary: 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400',
                                success: 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400',
                                info:    'bg-info-50 dark:bg-info-900/30 text-info-600 dark:text-info-400',
                                warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
                            };
                            return (
                                <div key={label} className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Weekly Activity */}
                    {weeklyActivity.length > 0 && (
                        <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-5 mb-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
                                {t('progress.weeklyActivity')}
                            </h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={weeklyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="pomodoroMinutes" name={t('progress.pomodoroMinutes')} stackId="1" stroke="#0D9488" fill="#0D9488" fillOpacity={0.25} />
                                    <Area type="monotone" dataKey="habits"          name={t('progress.habits')}          stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                                    <Area type="monotone" dataKey="reviews"         name={t('progress.reviews')}         stackId="1" stroke="#2DD4BF" fill="#2DD4BF" fillOpacity={0.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Study Time */}
                        {studyTime.length > 0 && (
                            <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
                                    {t('progress.studyTime')}
                                </h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={studyTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(d) => d.slice(5)} />
                                        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} min`, t('progress.pomodoroMinutes')]} />
                                        <Bar dataKey="minutes" fill="#0D9488" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Test Scores */}
                        {testScores.length > 0 && (
                            <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
                                    {t('progress.testScores')}
                                </h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={testScores}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(d) => d.slice(5)} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Score']} />
                                        <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
