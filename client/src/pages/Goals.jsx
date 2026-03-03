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

const TEMPLATE_DATA = {
    loseWeight: {
        focus: 'healthFitness',
        duration: 'monthly',
        titleKey: 'goals.templateData.loseWeight.title',
        milestoneKeys: [
            'goals.templateData.loseWeight.m1',
            'goals.templateData.loseWeight.m2',
            'goals.templateData.loseWeight.m3',
            'goals.templateData.loseWeight.m4',
            'goals.templateData.loseWeight.m5',
            'goals.templateData.loseWeight.m6',
        ],
    },
    learnLanguage: {
        focus: 'educationLearning',
        duration: 'shortTerm',
        titleKey: 'goals.templateData.learnLanguage.title',
        milestoneKeys: [
            'goals.templateData.learnLanguage.m1',
            'goals.templateData.learnLanguage.m2',
            'goals.templateData.learnLanguage.m3',
            'goals.templateData.learnLanguage.m4',
            'goals.templateData.learnLanguage.m5',
            'goals.templateData.learnLanguage.m6',
        ],
    },
    readMore: {
        focus: 'personalGrowth',
        duration: 'monthly',
        titleKey: 'goals.templateData.readMore.title',
        milestoneKeys: [
            'goals.templateData.readMore.m1',
            'goals.templateData.readMore.m2',
            'goals.templateData.readMore.m3',
            'goals.templateData.readMore.m4',
            'goals.templateData.readMore.m5',
            'goals.templateData.readMore.m6',
        ],
    },
    sideHustle: {
        focus: 'moneyFinance',
        duration: 'shortTerm',
        titleKey: 'goals.templateData.sideHustle.title',
        milestoneKeys: [
            'goals.templateData.sideHustle.m1',
            'goals.templateData.sideHustle.m2',
            'goals.templateData.sideHustle.m3',
            'goals.templateData.sideHustle.m4',
            'goals.templateData.sideHustle.m5',
            'goals.templateData.sideHustle.m6',
        ],
    },
    productivity: {
        focus: 'personalGrowth',
        duration: 'monthly',
        titleKey: 'goals.templateData.productivity.title',
        milestoneKeys: [
            'goals.templateData.productivity.m1',
            'goals.templateData.productivity.m2',
            'goals.templateData.productivity.m3',
            'goals.templateData.productivity.m4',
            'goals.templateData.productivity.m5',
            'goals.templateData.productivity.m6',
        ],
    },
    weightlifting: {
        focus: 'healthFitness',
        duration: 'shortTerm',
        titleKey: 'goals.templateData.weightlifting.title',
        milestoneKeys: [
            'goals.templateData.weightlifting.m1',
            'goals.templateData.weightlifting.m2',
            'goals.templateData.weightlifting.m3',
            'goals.templateData.weightlifting.m4',
            'goals.templateData.weightlifting.m5',
            'goals.templateData.weightlifting.m6',
        ],
    },
};

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
    const [selectedTemplate, setSelectedTemplate] = useState(null);
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
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">{t('goals.title')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('goals.subtitle')}</p>
                <div className="text-center py-16 text-slate-400">{t('dashboard.loading')}</div>
            </div>
        );
    }

    // Empty state
    if (step === 'empty') {
        return (
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">{t('goals.title')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-12">{t('goals.subtitle')}</p>

                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-6">
                        <Target size={40} className="text-primary-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-md">
                        {t('goals.emptyMessage')}
                    </p>
                    <button
                        onClick={() => setStep('templates')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-[10px] font-semibold hover:bg-primary-700 transition-colors shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1)]"
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
            <div>
                <button
                    onClick={() => setStep(goals.length > 0 ? 'list' : 'empty')}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t('goals.back')}
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">{t('goals.templates')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('goals.subtitle')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {GOAL_TEMPLATES.map(({ key, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => { setEditingGoalId(null); setSelectedTemplate(key); setStep('specify'); }}
                            className="bg-[#161A22] rounded-2xl border border-white/[0.06] p-5 text-left hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08)] hover:-translate-y-0.5 hover:border-primary-200 dark:hover:border-primary-900 transition-all cursor-pointer shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-3">
                                <Icon size={24} className="text-primary-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                                {t(`goals.templateNames.${key}`)}
                            </h3>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => { setEditingGoalId(null); setSelectedTemplate(null); setStep('specify'); }}
                    className="w-full bg-[#161A22] rounded-2xl border-2 border-dashed border-white/[0.10] p-5 text-left hover:border-primary-500/50 transition-all cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center">
                            <Pencil size={24} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('goals.buildOwn')}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('goals.buildOwnDesc')}</p>
                        </div>
                    </div>
                </button>
            </div>
        );
    }

    // Goal specification (create or edit)
    if (step === 'specify') {
        return (
            <GoalSpecify
                goalId={editingGoalId}
                templateKey={selectedTemplate}
                templateData={selectedTemplate ? TEMPLATE_DATA[selectedTemplate] : null}
                onBack={() => { setEditingGoalId(null); setSelectedTemplate(null); setStep(goals.length > 0 ? 'list' : 'empty'); }}
                onSaved={handleGoalSaved}
            />
        );
    }

    // Goal list view
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('goals.title')}</h1>
                <button
                    onClick={() => setStep('templates')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-[10px] font-medium text-sm hover:bg-primary-700 transition-colors shrink-0"
                >
                    <Plus size={16} />
                    {t('goals.addGoal')}
                </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t('goals.subtitle')}</p>

            {/* Filter & Sort Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                    {['active', 'all', 'completed', 'failed'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors ${
                                statusFilter === s
                                    ? s === 'completed' ? 'bg-success-600 text-white'
                                    : s === 'failed' ? 'bg-error-600 text-white'
                                    : 'bg-primary-600 text-white'
                                    : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
                            }`}
                        >
                            {t(`goals.filter${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                        </button>
                    ))}
                </div>

                <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Focus filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Filter size={14} className="text-slate-400" />
                    <button
                        onClick={() => setFocusFilter('all')}
                        className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors ${
                            focusFilter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
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
                                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors flex items-center gap-1 ${
                                    focusFilter === f
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
                                }`}
                            >
                                <FocusIcon size={12} />
                                {f === 'Uncategorized' ? t('goals.specify.uncategorizedFocus') : t(`goals.specify.focuses.${f}`)}
                            </button>
                        );
                    })}
                </div>

                <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Sort order */}
                <button
                    onClick={() => setSortOrder(sortOrder === 'dreamFirst' ? 'monthlyFirst' : 'dreamFirst')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-medium bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] transition-colors"
                >
                    {sortOrder === 'dreamFirst' ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />}
                    {sortOrder === 'dreamFirst' ? t('goals.sortDreamFirst') : t('goals.sortMonthlyFirst')}
                </button>
            </div>

            {/* Goals List */}
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
                    <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-6">
                        <Target size={40} className="text-primary-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-md">
                        {t('goals.emptyMessage')}
                    </p>
                    <button
                        onClick={() => setStep('templates')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-[10px] font-semibold hover:bg-primary-700 transition-colors shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1)]"
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
        <div className={`rounded-2xl overflow-hidden border shadow-[0_1px_3px_0_rgb(0_0_0/0.07)] ${
            isCompleted
                ? 'bg-success-950/20 border-success-800'
                : isFailed
                    ? 'bg-error-950/20 border-error-800'
                    : 'bg-[#161A22] border-white/[0.06]'
        }`}>
            {/* Goal header row */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
                {/* Focus icon */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-success-100 dark:bg-success-900' : isFailed ? 'bg-error-100 dark:bg-error-900' : 'bg-primary-50 dark:bg-primary-950'
                }`}>
                    <FocusIcon size={18} className={isCompleted ? 'text-success-500' : isFailed ? 'text-error-500' : 'text-primary-500'} />
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm sm:text-base">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {t(`goals.specify.durations.${goal.duration}`)}
                        </span>
                        {totalMilestones > 0 && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                {completedMilestones}/{totalMilestones} {t('goals.milestones')}
                            </span>
                        )}
                        {/* Progress % inline on mobile */}
                        {totalMilestones > 0 && (
                            <span className="sm:hidden text-xs font-medium text-primary-400">{progress}%</span>
                        )}
                    </div>
                </div>

                {/* Progress bar — desktop only */}
                {totalMilestones > 0 && (
                    <div className="w-20 shrink-0 hidden sm:block">
                        <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-0.5">{progress}%</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {(isCompleted || isFailed) && (
                        <button
                            onClick={onReactivate}
                            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 rounded-[10px] hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                            title={t('goals.reactivate')}
                        >
                            <RotateCcw size={13} />
                            <span className="hidden sm:inline">{t('goals.reactivate')}</span>
                        </button>
                    )}

                    {!isCompleted && !isFailed && (
                        <Link
                            to={`/plans?goalId=${goal.id}`}
                            className="p-2 text-slate-400 hover:text-success-500 transition-colors rounded-lg hover:bg-white/[0.04]"
                            title={t('goals.generatePlan')}
                        >
                            <Sparkles size={15} />
                        </Link>
                    )}

                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-white/[0.04]"
                        title={t('goals.editGoal')}
                    >
                        <Pencil size={15} />
                    </button>

                    {totalMilestones > 0 && (
                        <button
                            onClick={onToggleExpand}
                            className="flex items-center gap-0.5 p-2 sm:px-3 sm:py-1.5 text-sm font-medium text-slate-400 hover:text-white bg-white/[0.05] rounded-[10px] hover:bg-white/[0.08] transition-colors"
                        >
                            <span className="hidden sm:inline">{t('goals.open')}</span>
                            <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded milestones */}
            {isExpanded && goal.milestones?.length > 0 && (
                <div className="border-t border-white/[0.06] px-5 py-4">
                    <div className="space-y-2">
                        {goal.milestones.filter(m => !m.isCompleted).map((milestone) => (
                            <label
                                key={milestone.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                            >
                                <button
                                    onClick={(e) => { e.preventDefault(); onToggleMilestone(milestone.id); }}
                                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-primary-400 flex items-center justify-center shrink-0 transition-colors"
                                >
                                </button>
                                <span className="text-sm flex-1 text-slate-700 dark:text-slate-300">
                                    {milestone.title}
                                </span>
                                {milestone.targetDate && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
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
