import { useUser } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Layers, Timer, FileQuestion, GraduationCap, BarChart3 } from 'lucide-react';

const quickAccessCards = [
    { key: 'plans', icon: BookOpen, to: '/plans' },
    { key: 'flashcards', icon: Layers, to: '/flashcards' },
    { key: 'pomodoro', icon: Timer, to: '/pomodoro' },
    { key: 'tests', icon: FileQuestion, to: '/tests' },
    { key: 'techniques', icon: GraduationCap, to: '/learning' },
    { key: 'progress', icon: BarChart3, to: '/progress' },
];

export default function Dashboard() {
    const { user } = useUser();
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                {t('dashboard.welcome', { name: user?.firstName })}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('dashboard.subtitle')}</p>

            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                {t('dashboard.quickAccess')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickAccessCards.map(({ key, icon: Icon, to }) => (
                    <Link
                        key={key}
                        to={to}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-3">
                            <Icon size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            {t(`nav.${key}`)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t(`dashboard.cards.${key}`)}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
