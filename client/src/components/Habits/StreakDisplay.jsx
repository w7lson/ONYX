import { useTranslation } from 'react-i18next';
import { Flame, Trophy } from 'lucide-react';

export default function StreakDisplay({ currentStreak, longestStreak }) {
    const { t } = useTranslation();

    return (
        <>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
                    <Flame size={20} className="text-orange-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentStreak}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('habits.streak')}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-950 flex items-center justify-center">
                    <Trophy size={20} className="text-yellow-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{longestStreak}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('habits.longestStreak')}</p>
                </div>
            </div>
        </>
    );
}
