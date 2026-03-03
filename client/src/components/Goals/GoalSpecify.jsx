import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, ArrowRight, MoreVertical, Pencil, Target, CheckCircle, XCircle, RotateCcw, X, Plus } from 'lucide-react';
import FocusSelector from './FocusSelector';
import MilestoneList from './MilestoneList';
import GoalSidebar from './GoalSidebar';
import TemplateBrowser from './TemplateBrowser';

const DURATION_OPTIONS = [
    { key: 'dream', label: '5+ years' },
    { key: 'longTerm', label: '3-5 years' },
    { key: 'midTerm', label: '2-3 years' },
    { key: 'shortTerm', label: '6-24 months' },
    { key: 'monthly', label: '1-6 months' },
];

export default function GoalSpecify({ goalId, templateKey, templateData, onBack, onSaved }) {
    const { t } = useTranslation();
    const { getToken } = useAuth();

    // Track whether template is applied
    const [isTemplateApplied, setIsTemplateApplied] = useState(false);
    const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);

    // Wizard step: 1 = goal text, 2 = duration, 3 = milestones
    const [step, setStep] = useState(1);

    // Goal state
    const [focus, setFocus] = useState('Uncategorized');
    const [goalTitle, setGoalTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [milestones, setMilestones] = useState([
        { id: `temp-${Date.now()}`, title: 'First milestone', description: '', reward: '', targetDate: '', order: 0 },
    ]);

    // Apply template data on mount (only for new goals with a template)
    useEffect(() => {
        if (!goalId && templateData) {
            setFocus(templateData.focus);
            setDuration(templateData.duration);
            setGoalTitle(t(templateData.titleKey));
            setMilestones(
                templateData.milestoneKeys.map((key, i) => ({
                    id: `temp-${Date.now()}-${i}`,
                    title: t(key),
                    description: '',
                    reward: '',
                    targetDate: '',
                    order: i,
                }))
            );
            setIsTemplateApplied(true);
            setStep(3); // Skip to milestones since everything is pre-filled
        }
    }, []); // Run once on mount

    const handleRemoveTemplate = () => {
        setGoalTitle('');
        setMilestones([
            { id: `temp-${Date.now()}`, title: '', description: '', reward: '', targetDate: '', order: 0 },
        ]);
        setIsTemplateApplied(false);
    };

    const handleApplyBrowserTemplate = (templateGoal) => {
        setFocus(templateGoal.focus);
        setDuration(templateGoal.duration);
        setGoalTitle(t(templateGoal.titleKey));
        setMilestones(
            templateGoal.milestoneKeys.map((key, i) => ({
                id: `temp-${Date.now()}-${i}`,
                title: t(key),
                description: '',
                reward: '',
                targetDate: '',
                order: i,
            }))
        );
        setIsTemplateApplied(true);
        setShowTemplateBrowser(false);
        setStep(3);
    };

    // Sidebar state
    const [description, setDescription] = useState('');
    const [reward, setReward] = useState('');
    const [targetDate, setTargetDate] = useState('');

    const [goalStatus, setGoalStatus] = useState('active');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!goalId);
    const [showGoalMenu, setShowGoalMenu] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [showFocusPicker, setShowFocusPicker] = useState(false);
    const [showFailureForm, setShowFailureForm] = useState(false);
    const [failureReason, setFailureReason] = useState('');
    const [failureLesson, setFailureLesson] = useState('');
    const goalMenuRef = useRef(null);

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    }, [getToken]);

    // Close goal menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (goalMenuRef.current && !goalMenuRef.current.contains(e.target)) {
                setShowGoalMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCompleteGoal = async () => {
        if (!goalId) return;
        try {
            const { headers } = await authHeaders();
            const res = await fetch(`/api/goals/${goalId}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
            });
            if (res.ok && onSaved) onSaved();
        } catch (error) {
            console.error('Error completing goal:', error);
        }
    };

    const handleFailGoal = async () => {
        if (!goalId || !failureReason) return;
        try {
            const { headers } = await authHeaders();
            const res = await fetch(`/api/goals/${goalId}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'failed',
                    failureReason,
                    ...(failureLesson && { failureLesson }),
                }),
            });
            if (res.ok && onSaved) onSaved();
        } catch (error) {
            console.error('Error marking goal as failed:', error);
        }
    };

    const handleReactivateGoal = async () => {
        if (!goalId) return;
        try {
            const { headers } = await authHeaders();
            const res = await fetch(`/api/goals/${goalId}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            });
            if (res.ok && onSaved) onSaved();
        } catch (error) {
            console.error('Error reactivating goal:', error);
        }
    };

    const FAILURE_REASONS = [
        'lostMotivation',
        'notEnoughTime',
        'unrealistic',
        'changedPriorities',
        'other',
    ];

    // Load existing goal for editing
    useEffect(() => {
        if (!goalId) return;
        const loadGoal = async () => {
            try {
                const { headers } = await authHeaders();
                const res = await fetch(`/api/goals/${goalId}`, { headers });
                if (res.ok) {
                    const goal = await res.json();
                    setGoalTitle(goal.title);
                    setGoalStatus(goal.status || 'active');
                    setFocus(goal.focus || 'Uncategorized');
                    setDuration(goal.duration);
                    setDescription(goal.description || '');
                    setReward(goal.reward || '');
                    setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
                    if (goal.milestones?.length > 0) {
                        setMilestones(goal.milestones.filter(m => !m.isCompleted).map(m => ({
                            id: m.id,
                            title: m.title,
                            description: m.description || '',
                            reward: m.reward || '',
                            targetDate: m.targetDate ? m.targetDate.split('T')[0] : '',
                            order: m.order,
                            isCompleted: m.isCompleted,
                        })));
                    }
                    setStep(3); // Jump to milestones step for editing
                }
            } catch (error) {
                console.error('Error loading goal:', error);
            } finally {
                setLoading(false);
            }
        };
        loadGoal();
    }, [goalId, authHeaders]);

    const handleSave = async () => {
        if (!goalTitle.trim() || !duration) return;

        setSaving(true);
        try {
            const { headers } = await authHeaders();
            const validMilestones = milestones
                .filter(m => m.title.trim())
                .map((m, i) => ({
                    title: m.title,
                    description: m.description || undefined,
                    reward: m.reward || undefined,
                    targetDate: m.targetDate || undefined,
                    order: i,
                    isCompleted: m.isCompleted || false,
                }));

            if (goalId) {
                // Update existing goal
                const goalRes = await fetch(`/api/goals/${goalId}`, {
                    method: 'PUT',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: goalTitle.trim(),
                        description: description || undefined,
                        focus,
                        duration,
                        reward: reward || undefined,
                        targetDate: targetDate || undefined,
                    }),
                });
                if (!goalRes.ok) throw new Error('Failed to update goal');

                // Update milestones
                await fetch(`/api/goals/${goalId}/milestones`, {
                    method: 'PUT',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ milestones: validMilestones }),
                });
            } else {
                // Create new goal
                const res = await fetch('/api/goals', {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: goalTitle.trim(),
                        description: description || undefined,
                        focus,
                        duration,
                        reward: reward || undefined,
                        targetDate: targetDate || undefined,
                        milestones: validMilestones,
                    }),
                });
                if (!res.ok) throw new Error('Failed to save goal');
            }

            if (onSaved) onSaved();
        } catch (error) {
            console.error('Error saving goal:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (goalId) {
            try {
                const { headers } = await authHeaders();
                await fetch(`/api/goals/${goalId}`, { method: 'DELETE', headers });
                if (onSaved) onSaved();
            } catch (error) {
                console.error('Error deleting goal:', error);
            }
        } else {
            onBack();
        }
    };

    if (loading) {
        return <div className="text-center py-16 text-slate-400">{t('dashboard.loading')}</div>;
    }

    return (
        <div>
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('goals.back')}
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">
                {t('goals.specifyTitle')}
            </h1>
            <p className="text-slate-400 mb-6">{t('goals.specify.subtitle')}</p>

            {/* Focus bar */}
            <FocusSelector focus={focus} onFocusChange={setFocus} />

            {/* 75/25 layout (full width when template browser is open) */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Questions */}
                <div className={showTemplateBrowser ? 'w-full' : 'w-full md:w-3/4'}>
                    {/* Step 1: Goal text */}
                    {step === 1 && (
                        <div className="bg-[#161A22] border border-white/[0.06] rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-100 mb-2">
                                {t('goals.specify.q1')}
                            </h2>
                            <textarea
                                value={goalTitle}
                                onChange={(e) => setGoalTitle(e.target.value)}
                                placeholder={t('goals.specify.q1Placeholder')}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-base"
                            />
                            {goalTitle.trim() && (
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                    >
                                        {t('goals.specify.next')}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Duration */}
                    {step === 2 && (
                        <div className="bg-[#161A22] border border-white/[0.06] rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-100 mb-4">
                                {t('goals.specify.q2')}
                            </h2>
                            <div className="grid grid-cols-5 gap-2">
                                {DURATION_OPTIONS.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setDuration(key);
                                            setStep(3);
                                        }}
                                        className={`flex flex-col items-center text-center p-4 rounded-lg border transition-all ${
                                            duration === key
                                                ? 'border-primary-500 bg-primary-950/40 text-primary-300'
                                                : 'border-white/[0.08] hover:border-primary-500/40 text-slate-300'
                                        }`}
                                    >
                                        <span className="font-medium text-sm">{t(`goals.specify.durations.${key}`)}</span>
                                        <span className="text-xs text-slate-500 mt-1">{label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-start mt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    {t('goals.specify.previous')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Milestones */}
                    {step === 3 && (
                        <div className="bg-[#161A22] border border-white/[0.06] rounded-xl p-6">
                            {/* Summary of selections with 3-dots menu */}
                            <div className="mb-6 pb-4 border-b border-white/[0.06] flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-400">
                                        {t('goals.specify.yourGoal')}:
                                        {renaming ? (
                                            <input
                                                type="text"
                                                value={goalTitle}
                                                onChange={(e) => setGoalTitle(e.target.value)}
                                                onBlur={() => setRenaming(false)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') setRenaming(false); }}
                                                autoFocus
                                                className="ml-1 font-medium text-slate-100 bg-transparent border-b border-primary-500 focus:outline-none"
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-100 ml-1">{goalTitle}</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {t('goals.specify.timeline')}:
                                        <span className="font-medium text-slate-100 ml-1">
                                            {t(`goals.specify.durations.${duration}`)}
                                        </span>
                                    </p>
                                </div>
                                <div ref={goalMenuRef} className="relative ml-2">
                                    {/* Remove template button (replaces 3-dots for unsaved templates) */}
                                    {!goalId && isTemplateApplied && (
                                        <button
                                            onClick={handleRemoveTemplate}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-950/30 rounded-lg hover:bg-red-900/30 transition-colors"
                                        >
                                            <X size={14} />
                                            {t('goals.removeTemplate')}
                                        </button>
                                    )}

                                    {/* Add a template button (shows after removing template) */}
                                    {!goalId && !isTemplateApplied && (
                                        <button
                                            onClick={() => setShowTemplateBrowser(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-400 bg-primary-950/30 rounded-lg hover:bg-primary-900/30 transition-colors"
                                        >
                                            <Plus size={14} />
                                            {t('goals.addTemplate')}
                                        </button>
                                    )}

                                    {/* 3-dots menu (only for saved goals) */}
                                    {goalId && (
                                        <>
                                            <button
                                                onClick={() => setShowGoalMenu(!showGoalMenu)}
                                                className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-white/[0.06]"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            {showGoalMenu && (
                                                <div className="absolute right-0 top-full mt-1 z-20 bg-[#1A1D24] border border-white/[0.08] rounded-lg shadow-lg py-1 min-w-[180px]">
                                                    <button
                                                        onClick={() => { setRenaming(true); setShowGoalMenu(false); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04]"
                                                    >
                                                        <Pencil size={14} />
                                                        {t('goals.specify.rename')}
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowFocusPicker(!showFocusPicker); setShowGoalMenu(false); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04]"
                                                    >
                                                        <Target size={14} />
                                                        {t('goals.specify.editFocus')}
                                                    </button>
                                                    <hr className="my-1 border-white/[0.06]" />
                                                    {(goalStatus === 'completed' || goalStatus === 'failed') ? (
                                                        <button
                                                            onClick={() => { handleReactivateGoal(); setShowGoalMenu(false); }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-blue-950/30"
                                                        >
                                                            <RotateCcw size={14} />
                                                            {t('goals.reactivate')}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => { handleCompleteGoal(); setShowGoalMenu(false); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-green-950/30"
                                                            >
                                                                <CheckCircle size={14} />
                                                                {t('goals.specify.complete')}
                                                            </button>
                                                            <button
                                                                onClick={() => { setShowFailureForm(true); setShowGoalMenu(false); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30"
                                                            >
                                                                <XCircle size={14} />
                                                                {t('goals.specify.failed')}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Inline focus picker */}
                            {showFocusPicker && (
                                <div className="mb-4">
                                    <FocusSelector focus={focus} onFocusChange={(f) => { setFocus(f); setShowFocusPicker(false); }} />
                                </div>
                            )}

                            {/* Inline template browser */}
                            {showTemplateBrowser && (
                                <div className="mb-4">
                                    <TemplateBrowser
                                        onSelect={handleApplyBrowserTemplate}
                                        onClose={() => setShowTemplateBrowser(false)}
                                    />
                                </div>
                            )}

                            {/* Failure reflection questionnaire */}
                            {showFailureForm && (
                                <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 rounded-lg">
                                    <h3 className="text-sm font-semibold text-red-400 mb-3">{t('goals.specify.failureTitle')}</h3>
                                    <div className="mb-3">
                                        <label className="block text-sm text-slate-300 mb-1">{t('goals.specify.failureReasonQ')}</label>
                                        <select
                                            value={failureReason}
                                            onChange={(e) => setFailureReason(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-red-800/50 bg-[#1A1D24] text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        >
                                            <option value="">{t('goals.specify.selectReason')}</option>
                                            {FAILURE_REASONS.map(r => (
                                                <option key={r} value={r}>{t(`goals.specify.failureReasons.${r}`)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm text-slate-300 mb-1">{t('goals.specify.failureLessonQ')}</label>
                                        <textarea
                                            value={failureLesson}
                                            onChange={(e) => setFailureLesson(e.target.value)}
                                            placeholder={t('goals.specify.failureLessonPlaceholder')}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg border border-red-800/50 bg-[#1A1D24] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleFailGoal}
                                            disabled={!failureReason}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {t('goals.specify.submitFailure')}
                                        </button>
                                        <button
                                            onClick={() => setShowFailureForm(false)}
                                            className="px-4 py-2 text-slate-400 text-sm hover:text-slate-200 transition-colors"
                                        >
                                            {t('goals.specify.cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <MilestoneList milestones={milestones} onChange={setMilestones} />

                            <div className="flex justify-start mt-6">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    {t('goals.specify.previous')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Sidebar (25%) — hidden when template browser is open */}
                {!showTemplateBrowser && <div className="w-full md:w-1/4">
                    <GoalSidebar
                        description={description}
                        reward={reward}
                        targetDate={targetDate}
                        onDescriptionChange={setDescription}
                        onRewardChange={setReward}
                        onTargetDateChange={setTargetDate}
                        onDelete={handleDelete}
                        onSave={handleSave}
                        saving={saving}
                    />
                </div>}
            </div>
        </div>
    );
}
