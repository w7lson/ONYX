import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function Plans() {
    const { getToken } = useAuth();
    const { t } = useTranslation();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchPlans();
    }, [getToken]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <p className="text-gray-500 dark:text-gray-400">{t('plans.loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                {t('plans.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('plans.subtitle')}</p>

            {plans.length === 0 ? (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{t('plans.noPlans')}</p>
                    <Link
                        to="/onboarding"
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        {t('plans.startOnboarding')}
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{plan.title}</h2>
                                    {plan.description && (
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                                    )}
                                </div>
                                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                    {plan.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {plan.modules.map((module) => {
                                    const completedTasks = module.tasks.filter(t => t.isCompleted).length;
                                    const totalTasks = module.tasks.length;

                                    return (
                                        <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-gray-700 dark:text-gray-200">{module.title}</h3>
                                                <span className="text-sm text-gray-400">
                                                    {t('plans.min', { count: module.estimatedMinutes })}
                                                </span>
                                            </div>

                                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                                                />
                                            </div>

                                            <ul className="space-y-1">
                                                {module.tasks.map((task) => (
                                                    <li key={task.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className={task.isCompleted ? 'line-through text-gray-400 dark:text-gray-600' : ''}>
                                                            {task.isCompleted ? '✓' : '○'} {task.content}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
