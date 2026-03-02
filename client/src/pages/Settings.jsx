import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t } = useTranslation();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-slate-100 tracking-tight">
                {t('settings.title')}
            </h1>
            <p className="text-slate-500 mb-8">{t('settings.subtitle')}</p>

            <div className="bg-[#161A22] rounded-2xl border border-white/[0.06] p-6">
                <p className="text-slate-400 text-sm">
                    Language settings are in the{' '}
                    <span className="text-green-400 font-medium">My Account</span>{' '}
                    menu at the bottom of the sidebar.
                </p>
            </div>
        </div>
    );
}
