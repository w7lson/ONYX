import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, CheckCircle2, Circle, Sparkles, Target, Zap, BookOpen, ListChecks, SlidersHorizontal } from 'lucide-react';

const TASKS = [
    { key: 'hasPreferences', i18nKey: 'welcomeGuide.taskPreferences', icon: SlidersHorizontal, link: '/onboarding' },
    { key: 'hasGoal', i18nKey: 'welcomeGuide.taskGoal', icon: Target, link: '/goals' },
    { key: 'hasHabit', i18nKey: 'welcomeGuide.taskHabit', icon: ListChecks, link: '/dashboard' },
    { key: 'hasPlan', i18nKey: 'welcomeGuide.taskPlan', icon: Zap, link: '/plans' },
    { key: 'visitedTechniques', i18nKey: 'welcomeGuide.taskTechniques', icon: BookOpen, link: '/learning' },
];

export default function WelcomeGuide() {
    const { getToken } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(false);
    const [tasks, setTasks] = useState({
        hasPreferences: false,
        hasGoal: false,
        hasHabit: false,
        hasPlan: false,
        visitedTechniques: false,
    });
    const [hidden, setHidden] = useState(true);
    const [allDone, setAllDone] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch('/api/welcome-guide', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();

            if (data.completed) {
                setHidden(true);
                return;
            }

            const visitedTechniques = localStorage.getItem('onyx_visited_techniques') === 'true';

            setTasks({
                hasPreferences: data.tasks.hasPreferences || false,
                hasGoal: data.tasks.hasGoal || false,
                hasHabit: data.tasks.hasHabit || false,
                hasPlan: data.tasks.hasPlan || false,
                visitedTechniques,
            });
            setHidden(false);
        } catch {
            // silently fail
        }
    }, [getToken]);

    // Track techniques page visit
    useEffect(() => {
        if (location.pathname === '/learning') {
            localStorage.setItem('onyx_visited_techniques', 'true');
            setTasks(prev => ({ ...prev, visitedTechniques: true }));
        }
    }, [location.pathname]);

    // Fetch status on mount and on route changes
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus, location.pathname]);

    // Check if all tasks are done
    useEffect(() => {
        const allCompleted = Object.values(tasks).every(Boolean);
        if (allCompleted && !hidden && Object.values(tasks).some(Boolean)) {
            setAllDone(true);
            const timer = setTimeout(async () => {
                try {
                    const token = await getToken();
                    await fetch('/api/welcome-guide/complete', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } catch { /* ignore */ }
                localStorage.setItem('onyx_welcome_guide_completed', 'true');
                setHidden(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [tasks, hidden, getToken]);

    if (hidden) return null;

    const doneCount = Object.values(tasks).filter(Boolean).length;
    const totalCount = TASKS.length;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-3 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} />
                                <h3 className="font-semibold text-sm">{t('welcomeGuide.title')}</h3>
                            </div>
                            <p className="text-xs text-blue-100 mt-1">
                                {t('welcomeGuide.progress', { done: doneCount, total: totalCount })}
                            </p>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 bg-blue-400/30 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(doneCount / totalCount) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Tasks or All Done */}
                        <div className="p-3">
                            {allDone ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center py-4 text-center"
                                >
                                    <CheckCircle2 size={40} className="text-green-500 mb-2" />
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        {t('welcomeGuide.allDone')}
                                    </p>
                                </motion.div>
                            ) : (
                                <ul className="space-y-1">
                                    {TASKS.map(({ key, i18nKey, icon: Icon, link }) => {
                                        const isDone = tasks[key];
                                        return (
                                            <li key={key}>
                                                <button
                                                    onClick={() => {
                                                        if (!isDone) {
                                                            navigate(link);
                                                            setIsExpanded(false);
                                                        }
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                                        isDone
                                                            ? 'bg-green-50 dark:bg-green-900/20'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                                                    }`}
                                                >
                                                    {isDone ? (
                                                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                                    ) : (
                                                        <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                                                    )}
                                                    <Icon size={16} className={isDone ? 'text-green-500 shrink-0' : 'text-gray-400 dark:text-gray-500 shrink-0'} />
                                                    <span className={`text-sm ${
                                                        isDone
                                                            ? 'text-green-600 dark:text-green-400 line-through'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {t(i18nKey)}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button */}
            <motion.button
                onClick={() => setIsExpanded(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Sparkles size={16} />
                <span className="text-sm font-medium">{t('welcomeGuide.getStarted')}</span>
                {doneCount < totalCount && (
                    <span className="bg-white/20 text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {doneCount}/{totalCount}
                    </span>
                )}
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </motion.button>
        </div>
    );
}
