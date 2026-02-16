import { useTranslation } from 'react-i18next';

export default function Pomodoro() {
    const { t } = useTranslation();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                {t('pomodoroPage.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
                {t('pomodoroPage.subtitle')}
            </p>
        </div>
    );
}
