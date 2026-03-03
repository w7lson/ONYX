import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/clerk-react";
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, BookOpen } from 'lucide-react';
import axios from 'axios';
import PlanGenerator from '../components/Plans/PlanGenerator';
import PlanCard from '../components/Plans/PlanCard';

export default function Plans() {
    const { getToken } = useAuth();
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [preSelectedGoalId, setPreSelectedGoalId] = useState(null);

    useEffect(() => {
        const goalId = searchParams.get('goalId');
        if (goalId) {
            setPreSelectedGoalId(goalId);
            setView('generate');
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

    useEffect(() => { fetchPlans(); }, [getToken]);

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

    if (view === 'generate') {
        return (
            <div>
                <PlanGenerator
                    preSelectedGoalId={preSelectedGoalId}
                    onBack={() => { setView('list'); setPreSelectedGoalId(null); }}
                    onPlanSaved={handlePlanSaved}
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div>
                <p className="text-slate-500 dark:text-slate-400">{t('plans.loading')}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {t('plans.title')}
                </h1>
                <button
                    onClick={() => setView('generate')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-[10px] font-medium text-sm hover:bg-primary-700 transition-colors shrink-0"
                >
                    <Plus size={16} />
                    {t('plans.generatePlan')}
                </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t('plans.subtitle')}</p>

            {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-5">
                        <BookOpen size={32} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-sm">
                        {t('plans.noPlans')}
                    </p>
                    <button
                        onClick={() => setView('generate')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-[10px] font-semibold hover:bg-primary-700 transition-colors shadow-sm"
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
