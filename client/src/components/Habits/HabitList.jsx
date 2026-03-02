import { useTranslation } from 'react-i18next';
import { Trash2, Target, Pencil } from 'lucide-react';

export default function HabitList({ habits, onDelete, onEdit }) {
    const { t } = useTranslation();

    if (habits.length === 0) return null;

    return (
        <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-5">
            <h3 className="font-semibold text-slate-100 mb-4">
                {t('habits.allHabits')}
            </h3>
            <div className="space-y-2">
                {habits.map((habit) => (
                    <div
                        key={habit.id}
                        className="flex items-center gap-3 p-3 rounded-md bg-white/[0.04]"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-100">
                                {habit.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500">
                                    {habit.frequency === 'daily' ? t('habits.daily') : habit.frequency === 'weekly' ? t('habits.weekly') : t('habits.custom')}
                                </span>
                                {habit.goal && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Target size={10} />
                                        {habit.goal.title}
                                    </span>
                                )}
                                {habit.isAIGenerated && (
                                    <span className="text-xs text-purple-400">AI</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => onDelete(habit.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
