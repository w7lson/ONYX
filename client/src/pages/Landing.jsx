import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGuest } from '../contexts/GuestContext';

export default function Landing() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { enterGuestMode } = useGuest();

    const handleTryAsGuest = () => {
        enterGuestMode();
        navigate('/onboarding');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-center px-4 transition-colors">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                {t('landing.title')}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-md">
                {t('landing.subtitle')}
            </p>

            <SignedOut>
                <button
                    onClick={() => navigate('/onboarding')}
                    className="px-8 py-3 bg-primary-600 text-white rounded-[10px] font-semibold text-base hover:bg-primary-700 transition-colors shadow-sm"
                >
                    {t('landing.cta')}
                </button>
                <div className="mt-5 flex items-center gap-4">
                    <button
                        onClick={handleTryAsGuest}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors text-sm"
                    >
                        {t('landing.tryGuest')}
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <SignInButton mode="modal">
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors text-sm">
                            {t('landing.login')}
                        </button>
                    </SignInButton>
                </div>
            </SignedOut>

            <SignedIn>
                <Link to="/dashboard">
                    <button className="px-8 py-3 bg-primary-600 text-white rounded-[10px] font-semibold text-base hover:bg-primary-700 transition-colors shadow-sm">
                        {t('landing.cta')}
                    </button>
                </Link>
            </SignedIn>
        </div>
    );
}
