import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, Plus, Timer, BookOpen, FileText, Layers } from 'lucide-react';
import { SignInButton } from '@clerk/clerk-react';
import HabitChecklist from '../components/Habits/HabitChecklist';
import HabitCreateModal from '../components/Habits/HabitCreateModal';
import HabitList from '../components/Habits/HabitList';
import StreakDisplay from '../components/Habits/StreakDisplay';
import { useGuest } from '../contexts/GuestContext';

function GuestDashboard() {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                {t('guest.welcomeGuest')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('guest.dashboardSubtitle')}</p>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
                        <Target size={32} className="text-blue-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                        {t('guest.dashboardMessage')}
                    </p>
                    <SignInButton mode="modal">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                            {t('guest.signUpCta')}
                        </button>
                    </SignInButton>
                </div>
            </div>

            {/* Quick Actions (limited for guests) */}
            <div className="grid grid-cols-3 gap-3">
                <Link
                    to="/learning"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                    <BookOpen size={24} className="text-purple-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('nav.techniques')}</p>
                </Link>
                <Link
                    to="/plans"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                    <FileText size={24} className="text-green-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('nav.plans')}</p>
                </Link>
                <Link
                    to="/settings"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                    <Timer size={24} className="text-blue-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('nav.settings')}</p>
                </Link>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { isGuest } = useGuest();
    const { user } = useUser();
    const { getToken } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [todayHabits, setTodayHabits] = useState([]);
    const [allHabits, setAllHabits] = useState([]);
    const [streaks, setStreaks] = useState({ currentStreak: 0, longestStreak: 0 });
    const [stats, setStats] = useState({ activeGoals: 0, dueCards: 0 });
    const [showCreate, setShowCreate] = useState(false);
    const [showManage, setShowManage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeGoals, setActiveGoals] = useState([]);

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { Authorization: `Bearer ${token}` };
    }, [getToken]);

    // Check if user has completed onboarding (skip for guests)
    useEffect(() => {
        if (isGuest) return;
        const checkOnboarding = async () => {
            try {
                const headers = await authHeaders();

                // Sync any pending onboarding answers from pre-auth quiz
                const pending = localStorage.getItem('pendingOnboardingAnswers');
                if (pending) {
                    try {
                        const data = JSON.parse(pending);
                        const syncRes = await fetch('/api/preferences', {
                            method: 'POST',
                            headers: { ...headers, 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                        });
                        if (syncRes.ok) {
                            localStorage.removeItem('pendingOnboardingAnswers');
                            return; // Preferences synced, no need to check onboarding
                        }
                    } catch (syncErr) {
                        console.error('Failed to sync pending preferences:', syncErr);
                    }
                }

                const res = await fetch('/api/preferences', { headers });
                if (res.status === 404) {
                    navigate('/onboarding', { replace: true });
                    return;
                }
                if (res.ok) {
                    const prefs = await res.json();
                    if (!prefs.onboardingDone) {
                        navigate('/onboarding', { replace: true });
                    }
                }
            } catch (err) {
                // If preferences check fails, don't block dashboard
            }
        };
        checkOnboarding();
    }, [authHeaders, navigate, isGuest]);

    const fetchData = useCallback(async () => {
        if (isGuest) {
            setLoading(false);
            return;
        }
        try {
            const headers = await authHeaders();
            const [todayRes, allRes, streakRes, goalsRes, decksRes] = await Promise.all([
                fetch('/api/habits/today', { headers }),
                fetch('/api/habits', { headers }),
                fetch('/api/habits/streaks', { headers }),
                fetch('/api/goals', { headers }),
                fetch('/api/decks', { headers }),
            ]);

            if (todayRes.ok) setTodayHabits(await todayRes.json());
            if (allRes.ok) setAllHabits(await allRes.json());
            if (streakRes.ok) setStreaks(await streakRes.json());

            let activeGoals = 0;
            let dueCards = 0;
            if (goalsRes.ok) {
                const goals = await goalsRes.json();
                const active = goals.filter(g => g.status === 'active');
                activeGoals = active.length;
                setActiveGoals(active);
            }
            if (decksRes.ok) {
                const decks = await decksRes.json();
                dueCards = decks.reduce((sum, d) => sum + (d.dueCards || 0), 0);
            }
            setStats({ activeGoals, dueCards });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [authHeaders, isGuest]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleHabit = async (habitId, complete) => {
        try {
            const headers = await authHeaders();
            if (complete) {
                await fetch(`/api/habits/${habitId}/complete`, {
                    method: 'POST',
                    headers,
                });
            } else {
                await fetch(`/api/habits/${habitId}/complete`, {
                    method: 'DELETE',
                    headers,
                });
            }
            fetchData();
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    };

    const handleCreateHabit = async (habitData) => {
        try {
            const headers = await authHeaders();
            const res = await fetch('/api/habits', {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(habitData),
            });
            if (res.ok) {
                setShowCreate(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error creating habit:', error);
        }
    };

    const handleDeleteHabit = async (habitId) => {
        try {
            const headers = await authHeaders();
            await fetch(`/api/habits/${habitId}`, {
                method: 'DELETE',
                headers,
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
    };

    if (isGuest) return <GuestDashboard />;

    const completed = todayHabits.filter(h => h.completedToday).length;
    const hasHabits = allHabits.length > 0;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                {t('dashboard.welcome', { name: user?.firstName })}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('dashboard.subtitle')}</p>

            {/* Streak + Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StreakDisplay
                    currentStreak={streaks.currentStreak}
                    longestStreak={streaks.longestStreak}
                />
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                        <Target size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.activeGoals}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.activeGoals')}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                        <Layers size={20} className="text-purple-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.dueCards}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.dueCards')}</p>
                    </div>
                </div>
            </div>

            {/* Today's Habits or Empty State */}
            {loading ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.loading')}</p>
                </div>
            ) : hasHabits ? (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {t('habits.todayChecklist')}
                            {todayHabits.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                    {completed}/{todayHabits.length}
                                </span>
                            )}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowManage(!showManage)}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                {t('dashboard.manageHabits')}
                            </button>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                            >
                                <Plus size={14} />
                                {t('habits.createHabit')}
                            </button>
                        </div>
                    </div>
                    <HabitChecklist habits={todayHabits} onToggle={handleToggleHabit} />
                    {showManage && (
                        <div className="mt-4">
                            <HabitList habits={allHabits} onDelete={handleDeleteHabit} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
                            <Target size={32} className="text-blue-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                            {t('dashboard.noHabitsYet')}
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/goals"
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {t('dashboard.setupGoals')}
                            </Link>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('habits.createHabit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
                <Link
                    to="/pomodoro"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                    <Timer size={24} className="text-blue-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('dashboard.startPomodoro')}</p>
                </Link>
                <Link
                    to="/flashcards"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                    <BookOpen size={24} className="text-purple-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('dashboard.reviewFlashcards')}</p>
                </Link>
                <Link
                    to="/tests"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                    <FileText size={24} className="text-green-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('dashboard.takeTest')}</p>
                </Link>
            </div>

            {/* Create Habit Modal */}
            {showCreate && (
                <HabitCreateModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreateHabit}
                    goals={activeGoals}
                />
            )}
        </div>
    );
}
