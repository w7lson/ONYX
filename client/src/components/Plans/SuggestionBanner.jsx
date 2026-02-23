import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

export default function SuggestionBanner() {
    const { t } = useTranslation();

    return (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
                {t('plans.generator.suggestionBanner')}
            </p>
        </div>
    );
}
