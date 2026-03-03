import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, Plus, Timer, BookOpen, FileText, Layers } from 'lucide-react';
import HabitChecklist from '../components/Habits/HabitChecklist';
import HabitCreateModal from '../components/Habits/HabitCreateModal';
import HabitList from '../components/Habits/HabitList';
import StreakDisplay from '../components/Habits/StreakDisplay';

export default function Dashboard() {
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

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const headers = await authHeaders();
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
                            return;
                        }
                    } catch (syncErr) {
                        console.error('Failed to sync pending preferences:', syncErr);
                    }
                }
                const res = await fetch('/api/preferences', { headers });
                if (res.status === 404) { navigate('/onboarding', { replace: true }); return; }
                if (res.ok) {
                    const prefs = await res.json();
                    if (!prefs.onboardingDone) navigate('/onboarding', { replace: true });
                }
            } catch (err) { /* don't block dashboard */ }
        };
        checkOnboarding();
    }, [authHeaders, navigate]);

    const fetchData = useCallback(async () => {
        try {
            const headers = await authHeaders();
            const [todayRes, allRes, streakRes, goalsRes, decksRes] = await Promise.all([
                fetch('/api/habits/today', { headers }),
                fetch('/api/habits', { headers }),
                fetch('/api/habits/streaks', { headers }),
                fetch('/api/goals', { headers }),
                fetch('/api/decks', { headers }),
            ]);
            if (todayRes.ok)  setTodayHabits(await todayRes.json());
            if (allRes.ok)    setAllHabits(await allRes.json());
            if (streakRes.ok) setStreaks(await streakRes.json());

            let activeGoalsCount = 0, dueCards = 0;
            if (goalsRes.ok) {
                const goals = await goalsRes.json();
                const active = goals.filter(g => g.status === 'active');
                activeGoalsCount = active.length;
                setActiveGoals(active);
            }
            if (decksRes.ok) {
                const decks = await decksRes.json();
                dueCards = decks.reduce((sum, d) => sum + (d.dueCards || 0), 0);
            }
            setStats({ activeGoals: activeGoalsCount, dueCards });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggleHabit = async (habitId, complete) => {
        try {
            const headers = await authHeaders();
            await fetch(`/api/habits/${habitId}/complete`, {
                method: complete ? 'POST' : 'DELETE',
                headers,
            });
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
            if (res.ok) { setShowCreate(false); fetchData(); }
        } catch (error) {
            console.error('Error creating habit:', error);
        }
    };

    const handleDeleteHabit = async (habitId) => {
        try {
            const headers = await authHeaders();
            await fetch(`/api/habits/${habitId}`, { method: 'DELETE', headers });
            fetchData();
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
    };

    const completed = todayHabits.filter(h => h.completedToday).length;
    const hasHabits = allHabits.length > 0;

    return (
        <div>
            {/* Header */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-slate-900 dark:text-slate-100 tracking-tight">
                {t('dashboard.welcome', { name: user?.firstName })}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t('dashboard.subtitle')}</p>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StreakDisplay
                    currentStreak={streaks.currentStreak}
                    longestStreak={streaks.longestStreak}
                />
                <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-4 flex items-center gap-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
                        <Target size={20} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.activeGoals}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.activeGoals')}</p>
                    </div>
                </div>
                <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-4 flex items-center gap-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
                        <Layers size={20} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.dueCards}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.dueCards')}</p>
                    </div>
                </div>
            </div>

            {/* Today's Habits */}
            {loading ? (
                <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-8 text-center mb-6">
                    <p className="text-slate-500 dark:text-slate-400">{t('dashboard.loading')}</p>
                </div>
            ) : hasHabits ? (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {t('habits.todayChecklist')}
                            {todayHabits.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                                    {completed}/{todayHabits.length}
                                </span>
                            )}
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowManage(!showManage)}
                                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                                {t('dashboard.manageHabits')}
                            </button>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
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
                <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-10 mb-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
                            <Target size={32} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                            {t('dashboard.noHabitsYet')}
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/goals"
                                className="px-5 py-2.5 bg-primary-600 text-white rounded-[10px] font-medium hover:bg-primary-700 transition-colors"
                            >
                                {t('dashboard.setupGoals')}
                            </Link>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="px-5 py-2.5 bg-white/[0.06] text-slate-300 rounded-[10px] font-medium hover:bg-white/[0.10] transition-colors"
                            >
                                {t('habits.createHabit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                    { to: '/pomodoro',   icon: Timer,     label: t('dashboard.startPomodoro'),    color: 'text-primary-600 dark:text-primary-400' },
                    { to: '/flashcards', icon: BookOpen,  label: t('dashboard.reviewFlashcards'), color: 'text-primary-500' },
                    { to: '/tests',      icon: FileText,  label: t('dashboard.takeTest'),         color: 'text-success-600 dark:text-success-400' },
                ].map(({ to, icon: Icon, label, color }) => (
                    <Link
                        key={to}
                        to={to}
                        className="bg-[#161A22] border border-white/[0.06] rounded-lg p-3 sm:p-5 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08)] hover:-translate-y-0.5 hover:border-primary-200 dark:hover:border-primary-900 transition-all duration-150"
                    >
                        <Icon size={20} className={`${color} mb-1.5 sm:mb-2.5`} />
                        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight">{label}</p>
                    </Link>
                ))}
            </div>

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
