import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';

function CollapsibleSection({ title, defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 dark:border-gray-800">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
                {title}
                <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="pb-3">{children}</div>}
        </div>
    );
}

export default function GoalSidebar({ description, reward, targetDate, onDescriptionChange, onRewardChange, onTargetDateChange, onDelete, onSave, saving }) {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-fit">
            <CollapsibleSection title={t('goals.specify.description')}>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder={t('goals.specify.descriptionPlaceholder')}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('goals.specify.reward')}>
                <input
                    type="text"
                    value={reward}
                    onChange={(e) => onRewardChange(e.target.value)}
                    placeholder={t('goals.specify.rewardPlaceholder')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('goals.specify.targetDate')}>
                <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => onTargetDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </CollapsibleSection>

            <CollapsibleSection title={
                <span className="flex items-center gap-2">
                    {t('goals.specify.bestPractices')}
                    <Link to="/learning" className="text-blue-500 hover:text-blue-600">
                        <ExternalLink size={13} />
                    </Link>
                </span>
            }>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>{t('goals.specify.tip1')}</li>
                    <li>{t('goals.specify.tip2')}</li>
                    <li>{t('goals.specify.tip3')}</li>
                </ul>
            </CollapsibleSection>

            <div className="mt-6 space-y-2">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? t('goals.specify.saving') : t('goals.specify.savePlan')}
                </button>
                <button
                    onClick={onDelete}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                >
                    {t('goals.specify.deletePlan')}
                </button>
            </div>
        </div>
    );
}
