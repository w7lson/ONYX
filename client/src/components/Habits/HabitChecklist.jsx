import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Circle, Target } from 'lucide-react';

export default function HabitChecklist({ habits, onToggle }) {
    const { t } = useTranslation();

    if (habits.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                <Circle size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t('habits.noHabits')}</p>
            </div>
        );
    }

    const completed = habits.filter(h => h.completedToday).length;
    const allDone = completed === habits.length;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {t('habits.todayChecklist')}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {completed}/{habits.length}
                </span>
            </div>

            {allDone && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center"
                >
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {t('habits.allComplete')}
                    </p>
                </motion.div>
            )}

            <div className="space-y-2">
                {habits.map((habit) => (
                    <motion.button
                        key={habit.id}
                        onClick={() => onToggle(habit.id, !habit.completedToday)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            habit.completedToday
                                ? 'bg-green-50 dark:bg-green-950/50'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            habit.completedToday
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 dark:border-gray-600'
                        }`}>
                            {habit.completedToday && <Check size={12} className="text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium transition-colors ${
                                habit.completedToday
                                    ? 'text-green-700 dark:text-green-300 line-through'
                                    : 'text-gray-800 dark:text-gray-100'
                            }`}>
                                {habit.title}
                            </p>
                            {habit.goal && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Target size={10} />
                                    {habit.goal.title}
                                </p>
                            )}
                        </div>

                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                            {habit.frequency === 'daily' ? t('habits.daily') : t('habits.weekly')}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
