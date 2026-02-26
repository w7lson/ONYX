import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Sparkles, Loader2, RefreshCw, Save, X,
    ChevronDown, ChevronUp, Plus, Clock
} from 'lucide-react';
import axios from 'axios';
import GoalSelector from './GoalSelector';
import SuggestionBanner from './SuggestionBanner';
import ModuleEditor from './ModuleEditor';

const PREF_LABELS = {
    currentLevel: { key: 'currentLevel', icon: Clock },
    pace: { key: 'pace' },
    learningStyle: { key: 'learningStyle' },
    preferredContent: { key: 'preferredContent' },
    reviewFrequency: { key: 'reviewFrequency' },
};

let tempIdCounter = 0;
const genTempId = () => `_temp_${++tempIdCounter}`;

export default function PlanGenerator({ preSelectedGoalId, onBack, onPlanSaved }) {
    const { t } = useTranslation();
    const { getToken } = useAuth();

    const [activeGoals, setActiveGoals] = useState([]);
    const [selectedGoalId, setSelectedGoalId] = useState(preSelectedGoalId || null);
    const [preferences, setPreferences] = useState(null);
    const [customInstructions, setCustomInstructions] = useState('');
    const [showCustomize, setShowCustomize] = useState(false);

    const [phase, setPhase] = useState('idle'); // idle | generating | preview | saving
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [suggestedHabits, setSuggestedHabits] = useState([]);
    const [error, setError] = useState(null);

    const selectedGoal = activeGoals.find(g => g.id === selectedGoalId);

    // Fetch active goals and preferences on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const headers = { Authorization: `Bearer ${token}` };

                const [goalsRes, prefsRes] = await Promise.all([
                    axios.get('/api/goals', { headers }),
                    axios.get('/api/preferences', { headers }).catch(() => ({ data: {} })),
                ]);

                const active = goalsRes.data.filter(g => g.status === 'active');
                setActiveGoals(active);
                setPreferences(prefsRes.data);

                // Auto-select if preSelectedGoalId
                if (preSelectedGoalId && active.find(g => g.id === preSelectedGoalId)) {
                    setSelectedGoalId(preSelectedGoalId);
                }
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };
        fetchData();
    }, [getToken, preSelectedGoalId]);

    const handleGenerate = async () => {
        if (!selectedGoalId) return;
        setPhase('generating');
        setError(null);

        try {
            const token = await getToken();
            const res = await axios.post('/api/plans/generate', {
                goalId: selectedGoalId,
                customInstructions: customInstructions.trim() || undefined,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { plan } = res.data;

            // Add temp IDs for local editing
            const planWithIds = {
                ...plan,
                modules: plan.modules.map(mod => ({
                    ...mod,
                    _tempId: genTempId(),
                    tasks: mod.tasks.map(task => ({
                        ...task,
                        _tempId: genTempId(),
                    })),
                })),
            };

            setGeneratedPlan(planWithIds);
            setSuggestedHabits(plan.suggestedHabits || []);
            setPhase('preview');
        } catch (err) {
            console.error('Error generating plan:', err);
            setError(t('plans.generator.generateError'));
            setPhase('idle');
        }
    };

    const handleSave = async () => {
        if (!generatedPlan) return;
        setPhase('saving');

        try {
            const token = await getToken();
            await axios.post('/api/plans', {
                goalId: selectedGoalId,
                title: generatedPlan.title,
                description: generatedPlan.description,
                modules: generatedPlan.modules.map(mod => ({
                    title: mod.title,
                    estimatedMinutes: mod.estimatedMinutes || 0,
                    tasks: mod.tasks.map(task => ({
                        content: task.content,
                        type: task.type || null,
                    })),
                })),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onPlanSaved?.();
        } catch (err) {
            console.error('Error saving plan:', err);
            setError(t('plans.generator.saveError'));
            setPhase('preview');
        }
    };

    const handleDiscard = () => {
        setGeneratedPlan(null);
        setSuggestedHabits([]);
        setPhase('idle');
    };

    const handleAddHabit = async (habit) => {
        try {
            const token = await getToken();
            await axios.post('/api/habits', {
                title: habit.title,
                description: habit.description,
                frequency: habit.frequency || 'daily',
                goalId: selectedGoalId,
                isAIGenerated: true,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Remove from suggestions
            setSuggestedHabits(prev => prev.filter(h => h.title !== habit.title));
        } catch (err) {
            console.error('Error adding habit:', err);
        }
    };

    // Plan editing helpers
    const updatePlanField = (field, value) => {
        setGeneratedPlan(prev => ({ ...prev, [field]: value }));
    };

    const updateModule = (moduleIndex, updates) => {
        setGeneratedPlan(prev => ({
            ...prev,
            modules: prev.modules.map((mod, i) => i === moduleIndex ? { ...mod, ...updates } : mod),
        }));
    };

    const deleteModule = (moduleIndex) => {
        setGeneratedPlan(prev => ({
            ...prev,
            modules: prev.modules.filter((_, i) => i !== moduleIndex),
        }));
    };

    const moveModule = (fromIndex, direction) => {
        const toIndex = fromIndex + direction;
        setGeneratedPlan(prev => {
            const modules = [...prev.modules];
            [modules[fromIndex], modules[toIndex]] = [modules[toIndex], modules[fromIndex]];
            return { ...prev, modules };
        });
    };

    const addModule = () => {
        setGeneratedPlan(prev => ({
            ...prev,
            modules: [...prev.modules, {
                _tempId: genTempId(),
                title: t('plans.generator.newModule'),
                estimatedMinutes: 30,
                tasks: [],
            }],
        }));
    };

    const addTaskToModule = (moduleIndex, task) => {
        setGeneratedPlan(prev => ({
            ...prev,
            modules: prev.modules.map((mod, i) =>
                i === moduleIndex
                    ? { ...mod, tasks: [...mod.tasks, { ...task, _tempId: genTempId() }] }
                    : mod
            ),
        }));
    };

    const updateTaskInModule = (moduleIndex, taskIndex, updates) => {
        setGeneratedPlan(prev => ({
            ...prev,
            modules: prev.modules.map((mod, i) =>
                i === moduleIndex
                    ? { ...mod, tasks: mod.tasks.map((task, j) => j === taskIndex ? { ...task, ...updates } : task) }
                    : mod
            ),
        }));
    };

    const deleteTaskFromModule = (moduleIndex, taskIndex) => {
        setGeneratedPlan(prev => ({
            ...prev,
            modules: prev.modules.map((mod, i) =>
                i === moduleIndex
                    ? { ...mod, tasks: mod.tasks.filter((_, j) => j !== taskIndex) }
                    : mod
            ),
        }));
    };

    const hasPreferences = preferences && Object.values(PREF_LABELS).some(({ key }) => preferences[key]);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('plans.generator.backToPlans')}
            </button>

            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {t('plans.generator.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                {t('plans.generator.subtitle')}
            </p>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* SECTION 1: Select Goal */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    {t('plans.generator.selectGoal')}
                </h2>
                <GoalSelector
                    goals={activeGoals}
                    selectedGoalId={selectedGoalId}
                    onSelect={setSelectedGoalId}
                />
            </section>

            {/* SECTION 2: Goal Details (shown when selected) */}
            {selectedGoal && (
                <section className="mb-8 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                        {t('plans.generator.goalDetails')}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                            {selectedGoal.focus === 'Uncategorized' ? t('goals.specify.uncategorizedFocus') : t(`goals.specify.focuses.${selectedGoal.focus}`)}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            {t(`goals.specify.durations.${selectedGoal.duration}`)}
                        </span>
                        {selectedGoal.targetDate && (
                            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                {t('plans.generator.targetDate')}: {new Date(selectedGoal.targetDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    {selectedGoal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedGoal.description}</p>
                    )}

                    {selectedGoal.milestones?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('plans.generator.milestones')}
                            </h3>
                            <ol className="space-y-1.5">
                                {selectedGoal.milestones.map((m, i) => (
                                    <li key={m.id} className="flex items-start gap-2 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className={`text-gray-700 dark:text-gray-300 ${m.isCompleted ? 'line-through text-gray-400 dark:text-gray-600' : ''}`}>
                                            {m.title}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </section>
            )}

            {/* SECTION 3: Your Preferences */}
            {hasPreferences && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                        {t('plans.generator.yourPreferences')}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(PREF_LABELS).map(([field, { key }]) => {
                            const value = preferences[key];
                            if (!value) return null;
                            return (
                                <span key={field} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                    {t(`plans.preferences.${key}`)}: {value}
                                </span>
                            );
                        })}
                    </div>
                    <Link
                        to="/profile"
                        className="inline-block text-xs text-blue-500 hover:text-blue-600 mt-2 transition-colors"
                    >
                        {t('plans.generator.editPreferences')}
                    </Link>
                </section>
            )}

            {/* SECTION 4: Customize (collapsible) */}
            {phase === 'idle' && selectedGoalId && (
                <section className="mb-8">
                    <button
                        onClick={() => setShowCustomize(!showCustomize)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        {showCustomize ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {t('plans.generator.customize')}
                    </button>

                    {showCustomize && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                                {t('plans.generator.customizeHint')}
                            </p>
                            <textarea
                                value={customInstructions}
                                onChange={e => setCustomInstructions(e.target.value)}
                                placeholder={t('plans.generator.customPlaceholder')}
                                rows={3}
                                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none"
                            />
                        </div>
                    )}
                </section>
            )}

            {/* Generate button */}
            {(phase === 'idle' || phase === 'generating') && (
                <button
                    onClick={handleGenerate}
                    disabled={!selectedGoalId || phase === 'generating'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg mb-8"
                >
                    {phase === 'generating' ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            {t('plans.generator.generating')}
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            {t('plans.generator.generate')}
                        </>
                    )}
                </button>
            )}

            {/* SECTION 5: Generated Plan Preview */}
            {(phase === 'preview' || phase === 'saving') && generatedPlan && (
                <section className="mb-8">
                    <SuggestionBanner />

                    {/* Editable title */}
                    <div className="mt-6 mb-4">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {t('plans.generator.planTitle')}
                        </label>
                        <input
                            value={generatedPlan.title}
                            onChange={e => updatePlanField('title', e.target.value)}
                            className="w-full px-4 py-2.5 text-lg font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                        />
                    </div>

                    {/* Editable description */}
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {t('plans.generator.planDescription')}
                        </label>
                        <textarea
                            value={generatedPlan.description || ''}
                            onChange={e => updatePlanField('description', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 resize-none"
                        />
                    </div>

                    {/* Modules */}
                    <div className="space-y-4 mb-4">
                        {generatedPlan.modules.map((mod, index) => (
                            <ModuleEditor
                                key={mod._tempId || mod.id}
                                module={mod}
                                index={index}
                                totalModules={generatedPlan.modules.length}
                                onUpdate={(updates) => updateModule(index, updates)}
                                onDelete={() => deleteModule(index)}
                                onMoveUp={() => moveModule(index, -1)}
                                onMoveDown={() => moveModule(index, 1)}
                                onAddTask={(task) => addTaskToModule(index, task)}
                                onUpdateTask={(taskIndex, updates) => updateTaskInModule(index, taskIndex, updates)}
                                onDeleteTask={(taskIndex) => deleteTaskFromModule(index, taskIndex)}
                            />
                        ))}
                    </div>

                    {/* Add module button */}
                    <button
                        onClick={addModule}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-500 transition-colors"
                    >
                        <Plus size={16} />
                        {t('plans.generator.addModule')}
                    </button>

                    {/* Suggested Habits */}
                    {suggestedHabits.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                {t('plans.generator.suggestedHabits')}
                            </h3>
                            <div className="space-y-2">
                                {suggestedHabits.map((habit, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{habit.title}</p>
                                            {habit.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{habit.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddHabit(habit)}
                                            className="shrink-0 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            {t('plans.generator.addAsHabit')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-8">
                        <button
                            onClick={handleSave}
                            disabled={phase === 'saving' || generatedPlan.modules.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {phase === 'saving' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {t('plans.generator.savePlan')}
                        </button>

                        <button
                            onClick={handleGenerate}
                            disabled={phase === 'saving'}
                            className="flex items-center gap-2 px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <RefreshCw size={16} />
                            {t('plans.generator.regenerate')}
                        </button>

                        <button
                            onClick={handleDiscard}
                            disabled={phase === 'saving'}
                            className="flex items-center gap-2 px-5 py-3 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={16} />
                            {t('plans.generator.discard')}
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
