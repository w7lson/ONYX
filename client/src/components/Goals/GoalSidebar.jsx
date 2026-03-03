import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';

function CollapsibleSection({ title, defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-white/[0.06]">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
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
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div className="bg-[#161A22] border border-white/[0.06] rounded-xl p-4 h-fit">
            <CollapsibleSection title={t('goals.specify.description')}>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder={t('goals.specify.descriptionPlaceholder')}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('goals.specify.reward')}>
                <input
                    type="text"
                    value={reward}
                    onChange={(e) => onRewardChange(e.target.value)}
                    placeholder={t('goals.specify.rewardPlaceholder')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('goals.specify.targetDate')}>
                <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => onTargetDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>{t('goals.specify.tip1')}</li>
                    <li>{t('goals.specify.tip2')}</li>
                    <li>{t('goals.specify.tip3')}</li>
                </ul>
            </CollapsibleSection>

            <div className="mt-6 space-y-2">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? t('goals.specify.saving') : t('goals.specify.savePlan')}
                </button>
                {confirmDelete ? (
                    <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3">
                        <p className="text-xs text-red-400 mb-2 font-medium">Are you sure?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={onDelete}
                                className="flex-1 px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 px-3 py-1.5 text-sm font-semibold text-slate-300 bg-white/[0.06] rounded-lg hover:bg-white/[0.10] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-red-400 bg-red-950/30 rounded-lg hover:bg-red-900/30 transition-colors"
                    >
                        {t('goals.specify.deletePlan')}
                    </button>
                )}
            </div>
        </div>
    );
}
