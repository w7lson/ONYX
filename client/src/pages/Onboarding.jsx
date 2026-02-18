import { useTranslation } from 'react-i18next';
import Quiz from '../components/Onboarding/Quiz';

export default function Onboarding() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                        {t('onboarding.title')}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        {t('onboarding.subtitle')}
                    </p>
                </div>
                <Quiz />
            </div>
        </div>
    );
}
