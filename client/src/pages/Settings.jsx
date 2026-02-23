import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'uk', label: 'Українська' },
    { code: 'de', label: 'Deutsch' },
];

export default function Settings() {
    const { t, i18n } = useTranslation();

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('language', code);
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">{t('settings.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('settings.subtitle')}</p>

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe size={20} className="text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('settings.language')}</h2>
                    </div>
                    <div className="flex gap-3">
                        {languages.map(({ code, label }) => (
                            <button
                                key={code}
                                onClick={() => changeLanguage(code)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    i18n.language === code
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
