import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

export default function GoalSpecify({ onBack }) {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    const navigate = useNavigate();

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

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    }, [getToken]);

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
                }));

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
            navigate('/goals');
        } catch (error) {
            console.error('Error saving goal:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        onBack();
    };

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
                            {/* Summary of selections */}
                            <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('goals.specify.yourGoal')}:
                                    <span className="font-medium text-gray-800 dark:text-gray-100 ml-1">{goalTitle}</span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {t('goals.specify.timeline')}:
                                    <span className="font-medium text-gray-800 dark:text-gray-100 ml-1">
                                        {t(`goals.specify.durations.${duration}`)}
                                    </span>
                                </p>
                            </div>

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
