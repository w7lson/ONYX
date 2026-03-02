import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-react';
import { LogOut, AlertTriangle } from 'lucide-react';

export default function Settings() {
    const { t } = useTranslation();
    const { signOut } = useClerk();
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-1 text-slate-100 tracking-tight">
                {t('settings.title')}
            </h1>
            <p className="text-slate-500 mb-8">{t('settings.subtitle')}</p>

            {/* Account */}
            <div className="bg-[#161A22] rounded-2xl border border-white/[0.06] p-6">
                <h3 className="text-sm font-semibold text-slate-100 mb-1">Account</h3>
                <p className="text-xs text-slate-500 mb-4">Sign out of your ONYX Study account on this device.</p>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-error-400 bg-error-500/10 border border-error-500/20 rounded-xl hover:bg-error-500/20 transition-all"
                >
                    <LogOut size={15} />
                    {t('profile.signOut')}
                </button>
            </div>

            {/* Confirmation modal */}
            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="bg-[#161A22] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-error-500/15 flex items-center justify-center shrink-0">
                                <AlertTriangle size={17} className="text-error-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-100">Sign out?</h3>
                                <p className="text-xs text-slate-500 mt-0.5">You'll need to sign in again to access your account.</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] hover:text-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-error-600 rounded-xl hover:bg-error-500 transition-all"
                            >
                                {t('profile.signOut')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
