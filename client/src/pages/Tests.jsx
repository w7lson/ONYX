import { useTranslation } from 'react-i18next';

export default function Tests() {
    const { t } = useTranslation();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                {t('tests.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
                {t('tests.subtitle')}
            </p>
        </div>
    );
}
