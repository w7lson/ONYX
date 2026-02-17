import { useUser } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';

export default function Dashboard() {
    const { user } = useUser();
    const { t } = useTranslation();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                {t('dashboard.welcome', { name: user?.firstName })}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-12">{t('dashboard.subtitle')}</p>

            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
                    <Target size={32} className="text-blue-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                    {t('dashboard.noGoals')}
                </p>
                <Link
                    to="/goals"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    {t('dashboard.setupGoals')}
                </Link>
            </div>
        </div>
    );
}
