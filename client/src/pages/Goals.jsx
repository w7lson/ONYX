import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Dumbbell, Rocket, Trophy, Globe, BookOpen, Zap, Pencil, ArrowLeft } from 'lucide-react';

const GOAL_TEMPLATES = [
    { key: 'loseWeight', icon: Dumbbell },
    { key: 'sideHustle', icon: Rocket },
    { key: 'weightlifting', icon: Trophy },
    { key: 'learnLanguage', icon: Globe },
    { key: 'readMore', icon: BookOpen },
    { key: 'productivity', icon: Zap },
];

export default function Goals() {
    const { t } = useTranslation();
    const [step, setStep] = useState('empty'); // 'empty' | 'templates' | 'specify'
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleSelectTemplate = (templateKey) => {
        setSelectedTemplate(templateKey);
        setStep('specify');
    };

    const handleBuildOwn = () => {
        setSelectedTemplate('custom');
        setStep('specify');
    };

    // Step: Empty state
    if (step === 'empty') {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {t('goals.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">{t('goals.subtitle')}</p>

                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-6">
                        <Target size={40} className="text-blue-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
                        {t('goals.emptyMessage')}
                    </p>
                    <button
                        onClick={() => setStep('templates')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        {t('goals.setFirstGoal')}
                    </button>
                </div>
            </div>
        );
    }

    // Step: Template selection
    if (step === 'templates') {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <button
                    onClick={() => setStep('empty')}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t('goals.back')}
                </button>

                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {t('goals.templates')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{t('goals.subtitle')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {GOAL_TEMPLATES.map(({ key, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => handleSelectTemplate(key)}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-3">
                                <Icon size={24} className="text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                {t(`goals.templateNames.${key}`)}
                            </h3>
                        </button>
                    ))}
                </div>

                {/* Build your own */}
                <button
                    onClick={handleBuildOwn}
                    className="w-full bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-5 text-left hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Pencil size={24} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                {t('goals.buildOwn')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('goals.buildOwnDesc')}
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        );
    }

    // Step: Specify goal (placeholder)
    return (
        <div className="max-w-5xl mx-auto p-6">
            <button
                onClick={() => setStep('templates')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('goals.back')}
            </button>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {t('goals.specifyTitle')}
            </h1>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mt-6">
                <div className="flex flex-col items-center text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
                        <Target size={32} className="text-blue-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                        {t('goals.specifyMessage')}
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {selectedTemplate === 'custom'
                            ? t('goals.buildOwn')
                            : t(`goals.templateNames.${selectedTemplate}`)}
                    </p>
                </div>
            </div>
        </div>
    );
}
