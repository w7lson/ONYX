import { useTranslation } from 'react-i18next';
import { Layers, Timer, Brain, RefreshCw, MessageSquare, FileQuestion } from 'lucide-react';
import TechniqueCard from '../components/Learning/TechniqueCard';

const techniqueConfigs = [
    { key: 'spacedRepetition', icon: Layers, linkTo: '/flashcards' },
    { key: 'pomodoro', icon: Timer, linkTo: '/pomodoro' },
    { key: 'memoryPalace', icon: Brain },
    { key: 'activeRecall', icon: RefreshCw, linkTo: '/flashcards' },
    { key: 'feynman', icon: MessageSquare },
    { key: 'testing', icon: FileQuestion, linkTo: '/tests' },
];

export default function Learning() {
    const { t } = useTranslation();

    const techniques = techniqueConfigs.map(({ key, icon, linkTo }) => ({
        icon,
        title: t(`learning.${key}.title`),
        description: t(`learning.${key}.description`),
        steps: t(`learning.${key}.steps`, { returnObjects: true }),
        linkTo,
        linkLabel: t(`learning.${key}.cta`, { defaultValue: '' }) || undefined,
    }));

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {t('learning.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                {t('learning.subtitle')}
            </p>

            <div className="space-y-3">
                {techniques.map((technique) => (
                    <TechniqueCard key={technique.title} {...technique} />
                ))}
            </div>
        </div>
    );
}
