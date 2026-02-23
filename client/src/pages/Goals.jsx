import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import {
    Target, Dumbbell, Rocket, Trophy, Globe, BookOpen, Zap, Pencil, ArrowLeft,
    Plus, ChevronDown, Check, Briefcase, DollarSign, Heart, GraduationCap,
    Users, Sparkles, Palette, Home, Filter, ArrowDownAZ, ArrowUpAZ, RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import GoalSpecify from '../components/Goals/GoalSpecify';

const GOAL_TEMPLATES = [
    { key: 'loseWeight', icon: Dumbbell },
    { key: 'sideHustle', icon: Rocket },
    { key: 'weightlifting', icon: Trophy },
    { key: 'learnLanguage', icon: Globe },
    { key: 'readMore', icon: BookOpen },
    { key: 'productivity', icon: Zap },
];

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

const DURATION_ORDER = {
    dream: 0,
    longTerm: 1,
    midTerm: 2,
    shortTerm: 3,
    monthly: 4,
};

export default function Goals() {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    const [step, setStep] = useState('loading'); // 'loading' | 'list' | 'templates' | 'specify'
    const [goals, setGoals] = useState([]);
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [expandedGoalId, setExpandedGoalId] = useState(null);

    // Filter & sort
    const [focusFilter, setFocusFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');
    const [sortOrder, setSortOrder] = useState('dreamFirst'); // 'dreamFirst' | 'monthlyFirst'

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { Authorization: `Bearer ${token}` };
    }, [getToken]);

    const fetchGoals = useCallback(async () => {
        try {
            const headers = await authHeaders();
            const res = await fetch('/api/goals', { headers });
            if (res.ok) {
                const data = await res.json();
                setGoals(data);
                setStep(data.length > 0 ? 'list' : 'empty');
            } else {
                setStep('empty');
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
            setStep('empty');
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleGoalSaved = () => {
        setEditingGoalId(null);
        fetchGoals();
    };

    const handleEditGoal = (goalId) => {
        setEditingGoalId(goalId);
        setStep('specify');
    };

    const handleToggleMilestone = async (milestoneId) => {
        try {
            const headers = await authHeaders();
            const res = await fetch(`/api/milestones/${milestoneId}/toggle`, {
                method: 'PATCH',
                headers,
            });
            if (res.ok) {
                fetchGoals();
            }
        } catch (error) {
            console.error('Error toggling milestone:', error);
        }
    };

    const handleDeleteGoal = async (goalId) => {
        try {
            const headers = await authHeaders();
            await fetch(`/api/goals/${goalId}`, { method: 'DELETE', headers });
            fetchGoals();
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const handleReactivateGoal = async (goalId) => {
        try {
            const headers = await authHeaders();
            await fetch(`/api/goals/${goalId}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            });
            fetchGoals();
        } catch (error) {
            console.error('Error reactivating goal:', error);
        }
    };

    // Get unique focus categories from goals
    const focusCategories = [...new Set(goals.map(g => g.focus))];

    // Filter goals by status
    let filteredGoals = goals.filter(g => {
        if (statusFilter === 'active') return g.status !== 'completed' && g.status !== 'failed';
        if (statusFilter === 'completed') return g.status === 'completed';
        if (statusFilter === 'failed') return g.status === 'failed';
        return true;
    });

    // Filter by focus
    if (focusFilter !== 'all') {
        filteredGoals = filteredGoals.filter(g => g.focus === focusFilter);
    }

    // Sort goals
    filteredGoals = [...filteredGoals].sort((a, b) => {
        const orderA = DURATION_ORDER[a.duration] ?? 5;
        const orderB = DURATION_ORDER[b.duration] ?? 5;
        return sortOrder === 'dreamFirst' ? orderA - orderB : orderB - orderA;
    });

    // Loading
    if (step === 'loading') {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{t('goals.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{t('goals.subtitle')}</p>
                <div className="text-center py-16 text-gray-400">{t('dashboard.loading')}</div>
            </div>
        );
    }

    // Empty state
    if (step === 'empty') {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{t('goals.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">{t('goals.subtitle')}</p>

                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-6">
                        <Target size={40} className="text-blue-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
                        {t('goals.emptyMessage')}
                    </p>
                    <button
                        onClick={() => setStep('templates')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        {t('goals.setFirstGoal')}
                    </button>
                </div>
            </div>
        );
    }

    // Template selection
    if (step === 'templates') {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <button
                    onClick={() => setStep(goals.length > 0 ? 'list' : 'empty')}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t('goals.back')}
                </button>

                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{t('goals.templates')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{t('goals.subtitle')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {GOAL_TEMPLATES.map(({ key, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => { setEditingGoalId(null); setStep('specify'); }}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-3">
                                <Icon size={24} className="text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                {t(`goals.templateNames.${key}`)}
                            </h3>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => { setEditingGoalId(null); setStep('specify'); }}
                    className="w-full bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-5 text-left hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Pencil size={24} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('goals.buildOwn')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('goals.buildOwnDesc')}</p>
                        </div>
                    </div>
                </button>
            </div>
        );
    }

    // Goal specification (create or edit)
    if (step === 'specify') {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <GoalSpecify
                    goalId={editingGoalId}
                    onBack={() => { setEditingGoalId(null); setStep(goals.length > 0 ? 'list' : 'empty'); }}
                    onSaved={handleGoalSaved}
                />
            </div>
        );
    }

    // Goal list view
    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('goals.title')}</h1>
                <button
                    onClick={() => setStep('templates')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    {t('goals.addGoal')}
                </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('goals.subtitle')}</p>

            {/* Filter & Sort Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                    {['active', 'all', 'completed', 'failed'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                statusFilter === s
                                    ? s === 'completed' ? 'bg-green-600 text-white'
                                    : s === 'failed' ? 'bg-red-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t(`goals.filter${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                        </button>
                    ))}
                </div>

                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Focus filter */}
                <div className="flex items-center gap-1.5">
                    <Filter size={14} className="text-gray-400" />
                    <button
                        onClick={() => setFocusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            focusFilter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {t('goals.filterAll')}
                    </button>
                    {focusCategories.map(f => {
                        const FocusIcon = FOCUS_ICONS[f] || Target;
                        return (
                            <button
                                key={f}
                                onClick={() => setFocusFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                                    focusFilter === f
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <FocusIcon size={12} />
                                {f === 'Uncategorized' ? t('goals.specify.uncategorizedFocus') : t(`goals.specify.focuses.${f}`)}
                            </button>
                        );
                    })}
                </div>

                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Sort order */}
                <button
                    onClick={() => setSortOrder(sortOrder === 'dreamFirst' ? 'monthlyFirst' : 'dreamFirst')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    {sortOrder === 'dreamFirst' ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />}
                    {sortOrder === 'dreamFirst' ? t('goals.sortDreamFirst') : t('goals.sortMonthlyFirst')}
                </button>
            </div>

            {/* Goals Table */}
            {filteredGoals.length > 0 ? (
                <div className="space-y-3">
                    {filteredGoals.map(goal => (
                        <GoalRow
                            key={goal.id}
                            goal={goal}
                            isExpanded={expandedGoalId === goal.id}
                            onToggleExpand={() => setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id)}
                            onEdit={() => handleEditGoal(goal.id)}
                            onDelete={() => handleDeleteGoal(goal.id)}
                            onReactivate={() => handleReactivateGoal(goal.id)}
                            onToggleMilestone={handleToggleMilestone}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-6">
                        <Target size={40} className="text-blue-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
                        {t('goals.emptyMessage')}
                    </p>
                    <button
                        onClick={() => setStep('templates')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        {t('goals.setGoal')}
                    </button>
                </div>
            )}
        </div>
    );
}

function GoalRow({ goal, isExpanded, onToggleExpand, onEdit, onDelete, onReactivate, onToggleMilestone }) {
    const { t } = useTranslation();
    const FocusIcon = FOCUS_ICONS[goal.focus] || Target;
    const completedMilestones = goal.milestones?.filter(m => m.isCompleted).length || 0;
    const totalMilestones = goal.milestones?.length || 0;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const isCompleted = goal.status === 'completed';
    const isFailed = goal.status === 'failed';

    return (
        <div className={`rounded-xl overflow-hidden border ${
            isCompleted
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                : isFailed
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
        }`}>
            {/* Goal header row */}
            <div className="flex items-center gap-4 px-5 py-4">
                {/* Focus icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-green-100 dark:bg-green-900' : isFailed ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-50 dark:bg-blue-950'
                }`}>
                    <FocusIcon size={20} className={isCompleted ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-blue-500'} />
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{goal.title}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t(`goals.specify.durations.${goal.duration}`)}
                        </span>
                        {totalMilestones > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {completedMilestones}/{totalMilestones} {t('goals.milestones')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                {totalMilestones > 0 && (
                    <div className="w-24 shrink-0">
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-0.5">{progress}%</p>
                    </div>
                )}

                {/* Actions */}
                {(isCompleted || isFailed) && (
                    <button
                        onClick={onReactivate}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        title={t('goals.reactivate')}
                    >
                        <RotateCcw size={13} />
                        {t('goals.reactivate')}
                    </button>
                )}

                {!isCompleted && !isFailed && (
                    <Link
                        to={`/plans?goalId=${goal.id}`}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        title={t('goals.generatePlan')}
                    >
                        <Sparkles size={16} />
                    </Link>
                )}

                <button
                    onClick={onEdit}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    title={t('goals.editGoal')}
                >
                    <Pencil size={16} />
                </button>

                {totalMilestones > 0 && (
                    <button
                        onClick={onToggleExpand}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {t('goals.open')}
                        <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {/* Expanded milestones */}
            {isExpanded && goal.milestones?.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4">
                    <div className="space-y-2">
                        {goal.milestones.filter(m => !m.isCompleted).map((milestone) => (
                            <label
                                key={milestone.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <button
                                    onClick={(e) => { e.preventDefault(); onToggleMilestone(milestone.id); }}
                                    className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 flex items-center justify-center shrink-0 transition-colors"
                                >
                                </button>
                                <span className="text-sm flex-1 text-gray-700 dark:text-gray-300">
                                    {milestone.title}
                                </span>
                                {milestone.targetDate && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(milestone.targetDate).toLocaleDateString()}
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
