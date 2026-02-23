import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, ArrowRight, MoreVertical, Pencil, Target, CheckCircle, XCircle } from 'lucide-react';
import FocusSelector from './FocusSelector';
import MilestoneList from './MilestoneList';
import GoalSidebar from './GoalSidebar';

const DURATION_OPTIONS = [
    { key: 'dream', label: '5+ years' },
    { key: 'longTerm', label: '3-5 years' },
    { key: 'midTerm', label: '2-3 years' },
    { key: 'shortTerm', label: '6-24 months' },
    { key: 'monthly', label: '1-6 months' },
];

export default function GoalSpecify({ goalId, onBack, onSaved }) {
    const { t } = useTranslation();
    const { getToken } = useAuth();

    // Wizard step: 1 = goal text, 2 = duration, 3 = milestones
    const [step, setStep] = useState(1);

    // Goal state
    const [focus, setFocus] = useState('Uncategorized');
    const [goalTitle, setGoalTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [milestones, setMilestones] = useState([
        { id: `temp-${Date.now()}`, title: 'First milestone', description: '', reward: '', targetDate: '', order: 0 },
    ]);

    // Sidebar state
    const [description, setDescription] = useState('');
    const [reward, setReward] = useState('');
    const [targetDate, setTargetDate] = useState('');

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
        return <div className="text-center py-16 text-gray-400">{t('dashboard.loading')}</div>;
    }

    return (
        <div>
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('goals.back')}
            </button>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {t('goals.specifyTitle')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('goals.specify.subtitle')}</p>

            {/* Focus bar */}
            <FocusSelector focus={focus} onFocusChange={setFocus} />

            {/* 75/25 layout */}
            <div className="flex gap-6">
                {/* Left: Questions (75%) */}
                <div className="w-3/4">
                    {/* Step 1: Goal text */}
                    {step === 1 && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                {t('goals.specify.q1')}
                            </h2>
                            <textarea
                                value={goalTitle}
                                onChange={(e) => setGoalTitle(e.target.value)}
                                placeholder={t('goals.specify.q1Placeholder')}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-base"
                            />
                            {goalTitle.trim() && (
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
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
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <span className="font-medium text-sm">{t(`goals.specify.durations.${key}`)}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-start mt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    {t('goals.specify.previous')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Milestones */}
                    {step === 3 && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            {/* Summary of selections with 3-dots menu */}
                            <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t('goals.specify.yourGoal')}:
                                        {renaming ? (
                                            <input
                                                type="text"
                                                value={goalTitle}
                                                onChange={(e) => setGoalTitle(e.target.value)}
                                                onBlur={() => setRenaming(false)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') setRenaming(false); }}
                                                autoFocus
                                                className="ml-1 font-medium text-gray-800 dark:text-gray-100 bg-transparent border-b border-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-800 dark:text-gray-100 ml-1">{goalTitle}</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {t('goals.specify.timeline')}:
                                        <span className="font-medium text-gray-800 dark:text-gray-100 ml-1">
                                            {t(`goals.specify.durations.${duration}`)}
                                        </span>
                                    </p>
                                </div>
                                <div ref={goalMenuRef} className="relative ml-2">
                                    <button
                                        onClick={() => setShowGoalMenu(!showGoalMenu)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    {showGoalMenu && (
                                        <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]">
                                            <button
                                                onClick={() => { setRenaming(true); setShowGoalMenu(false); }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <Pencil size={14} />
                                                {t('goals.specify.rename')}
                                            </button>
                                            <button
                                                onClick={() => { setShowFocusPicker(!showFocusPicker); setShowGoalMenu(false); }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <Target size={14} />
                                                {t('goals.specify.editFocus')}
                                            </button>
                                            {goalId && (
                                                <>
                                                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                                                    <button
                                                        onClick={() => { handleCompleteGoal(); setShowGoalMenu(false); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                                                    >
                                                        <CheckCircle size={14} />
                                                        {t('goals.specify.complete')}
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowFailureForm(true); setShowGoalMenu(false); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                                                    >
                                                        <XCircle size={14} />
                                                        {t('goals.specify.failed')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Inline focus picker */}
                            {showFocusPicker && (
                                <div className="mb-4">
                                    <FocusSelector focus={focus} onFocusChange={(f) => { setFocus(f); setShowFocusPicker(false); }} />
                                </div>
                            )}

                            {/* Failure reflection questionnaire */}
                            {showFailureForm && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">{t('goals.specify.failureTitle')}</h3>
                                    <div className="mb-3">
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{t('goals.specify.failureReasonQ')}</label>
                                        <select
                                            value={failureReason}
                                            onChange={(e) => setFailureReason(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                        >
                                            <option value="">{t('goals.specify.selectReason')}</option>
                                            {FAILURE_REASONS.map(r => (
                                                <option key={r} value={r}>{t(`goals.specify.failureReasons.${r}`)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{t('goals.specify.failureLessonQ')}</label>
                                        <textarea
                                            value={failureLesson}
                                            onChange={(e) => setFailureLesson(e.target.value)}
                                            placeholder={t('goals.specify.failureLessonPlaceholder')}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
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
                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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
                                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    {t('goals.specify.previous')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Sidebar (25%) */}
                <div className="w-1/4">
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
                </div>
            </div>
        </div>
    );
}
