import { useEffect, useState } from 'react';
import { useUser, useAuth } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const { user } = useUser();
    const { getToken } = useAuth();
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
            <div className="max-w-4xl mx-auto p-6">
                <p className="text-gray-500">Loading your plans...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Welcome, {user?.firstName}!</h1>

            {plans.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                    <p className="text-gray-600 mb-4">No learning plans yet. Complete the onboarding quiz to create your first plan!</p>
                    <Link
                        to="/onboarding"
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Start Onboarding
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{plan.title}</h2>
                                    {plan.description && (
                                        <p className="text-gray-500 mt-1">{plan.description}</p>
                                    )}
                                </div>
                                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                                    {plan.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {plan.modules.map((module) => {
                                    const completedTasks = module.tasks.filter(t => t.isCompleted).length;
                                    const totalTasks = module.tasks.length;

                                    return (
                                        <div key={module.id} className="border rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-gray-700">{module.title}</h3>
                                                <span className="text-sm text-gray-400">
                                                    {module.estimatedMinutes} min
                                                </span>
                                            </div>

                                            <div className="h-2 bg-gray-100 rounded-full mb-3">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                                                />
                                            </div>

                                            <ul className="space-y-1">
                                                {module.tasks.map((task) => (
                                                    <li key={task.id} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className={task.isCompleted ? 'line-through text-gray-400' : ''}>
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
