import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Timer, FileText, Layers, Target } from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

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
            if (weeklyRes.ok) setWeeklyActivity(await weeklyRes.json());
            if (studyRes.ok) setStudyTime(await studyRes.json());
            if (scoresRes.ok) setTestScores(await scoresRes.json());
        } catch (error) {
            console.error('Error fetching progress data:', error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatMinutes = (min) => {
        if (min >= 60) return `${Math.round(min / 60)}h ${min % 60}m`;
        return `${min}m`;
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.loading')}</p>
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
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                {t('progress.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('progress.subtitle')}</p>

            {!hasData ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('progress.noData')}</p>
                </div>
            ) : (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <StatCard
                            icon={Timer}
                            color="blue"
                            value={formatMinutes(overview.pomodoro.totalMinutes)}
                            label={t('progress.totalStudyTime')}
                        />
                        <StatCard
                            icon={FileText}
                            color="green"
                            value={overview.tests.totalTaken > 0 ? `${overview.tests.avgScore}%` : '—'}
                            label={t('progress.testsAvgScore')}
                        />
                        <StatCard
                            icon={Layers}
                            color="purple"
                            value={overview.flashcards.totalReviews}
                            label={t('progress.flashcardReviews')}
                        />
                        <StatCard
                            icon={Target}
                            color="amber"
                            value={`${overview.goals.completed}/${overview.goals.total}`}
                            label={t('progress.goalsCompleted')}
                        />
                    </div>

                    {/* Weekly Activity Chart */}
                    {weeklyActivity.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                {t('progress.weeklyActivity')}
                            </h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={weeklyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#F3F4F6',
                                        }}
                                    />
                                    <Area type="monotone" dataKey="pomodoroMinutes" name={t('progress.pomodoroMinutes')} stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="habits" name={t('progress.habits')} stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="reviews" name={t('progress.reviews')} stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Study Time Chart */}
                        {studyTime.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    {t('progress.studyTime')}
                                </h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={studyTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                            tickFormatter={(d) => d.slice(5)}
                                        />
                                        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#F3F4F6',
                                            }}
                                            formatter={(value) => [`${value} min`, t('progress.pomodoroMinutes')]}
                                        />
                                        <Bar dataKey="minutes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Test Score Trend */}
                        {testScores.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    {t('progress.testScores')}
                                </h2>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={testScores}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                            tickFormatter={(d) => d.slice(5)}
                                        />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#F3F4F6',
                                            }}
                                            formatter={(value) => [`${value}%`, 'Score']}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
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

function StatCard({ icon: Icon, color, value, label }) {
    const colorMap = {
        blue: 'bg-blue-50 dark:bg-blue-950 text-blue-500',
        green: 'bg-green-50 dark:bg-green-950 text-green-500',
        purple: 'bg-purple-50 dark:bg-purple-950 text-purple-500',
        amber: 'bg-amber-50 dark:bg-amber-950 text-amber-500',
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
        </div>
    );
}
