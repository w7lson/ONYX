import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/clerk-react";
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import axios from 'axios';
import PlanGenerator from '../components/Plans/PlanGenerator';
import PlanCard from '../components/Plans/PlanCard';

export default function Plans() {
    const { getToken } = useAuth();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'generate'
    const [preSelectedGoalId, setPreSelectedGoalId] = useState(null);

    // Check for goalId query param
    useEffect(() => {
        const goalId = searchParams.get('goalId');
        if (goalId) {
            setPreSelectedGoalId(goalId);
            setView('generate');
            // Clean up query params
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const fetchPlans = async () => {
        try {
            const token = await getToken();
            const response = await axios.get('/api/plans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlans(response.data);
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [getToken]);

    const handleToggleTask = async (taskId) => {
        try {
            const token = await getToken();
            await axios.patch(`/api/tasks/${taskId}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlans();
        } catch (error) {
            console.error("Failed to toggle task:", error);
        }
    };

    const handlePlanSaved = () => {
        setView('list');
        setPreSelectedGoalId(null);
        fetchPlans();
    };

    // Generator view
    if (view === 'generate') {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <PlanGenerator
                    preSelectedGoalId={preSelectedGoalId}
                    onBack={() => { setView('list'); setPreSelectedGoalId(null); }}
                    onPlanSaved={handlePlanSaved}
                />
            </div>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <p className="text-gray-500 dark:text-gray-400">{t('plans.loading')}</p>
            </div>
        );
    }

    // List view
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {t('plans.title')}
                </h1>
                <button
                    onClick={() => setView('generate')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    {t('plans.generatePlan')}
                </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('plans.subtitle')}</p>

            {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-6">
                        <Plus size={32} className="text-blue-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                        {t('plans.noPlans')}
                    </p>
                    <button
                        onClick={() => setView('generate')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        {t('plans.generatePlan')}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onToggleTask={handleToggleTask}
                            onDelete={fetchPlans}
                            onRefresh={fetchPlans}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
