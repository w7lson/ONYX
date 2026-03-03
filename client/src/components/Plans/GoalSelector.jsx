import { useTranslation } from 'react-i18next';
import {
    Target, Briefcase, DollarSign, Heart, GraduationCap,
    Users, Sparkles, Palette, Home, Check
} from 'lucide-react';

const FOCUS_ICONS = {
    careerWork: Briefcase,
    moneyFinance: DollarSign,
    healthFitness: Heart,
    educationLearning: GraduationCap,
    relationshipsSocial: Users,
    personalGrowth: Sparkles,
    hobbiesCreative: Palette,
    homeLiving: Home,
    Uncategorized: Target,
};

export default function GoalSelector({ goals, selectedGoalId, onSelect }) {
    const { t } = useTranslation();

    if (goals.length === 0) {
        return (
            <div className="text-center py-8 bg-[#161A22] rounded-xl border border-dashed border-white/[0.10]">
                <Target size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('plans.generator.noActiveGoals')}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {goals.map(goal => {
                const FocusIcon = FOCUS_ICONS[goal.focus] || Target;
                const isSelected = selectedGoalId === goal.id;
                const completedMilestones = goal.milestones?.filter(m => m.isCompleted).length || 0;
                const totalMilestones = goal.milestones?.length || 0;

                return (
                    <button
                        key={goal.id}
                        onClick={() => onSelect(goal.id)}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                                ? 'border-blue-500 bg-[#161A22] shadow-md'
                                : 'border-white/[0.06] bg-[#161A22] hover:border-blue-900'
                        }`}
                    >
                        {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check size={12} className="text-white" />
                            </div>
                        )}

                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                            isSelected ? 'bg-blue-900/40' : 'bg-white/[0.06]'
                        }`}>
                            <FocusIcon size={20} className={isSelected ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'} />
                        </div>

                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate pr-6">
                            {goal.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {t(`goals.specify.durations.${goal.duration}`)}
                            </span>
                            {totalMilestones > 0 && (
                                <>
                                    <span className="text-gray-300 dark:text-gray-600">·</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {completedMilestones}/{totalMilestones} {t('goals.milestones')}
                                    </span>
                                </>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
