import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Landing() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 text-center px-4 transition-colors">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{t('landing.title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('landing.subtitle')}</p>

            <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                        {t('landing.cta')}
                    </button>
                </SignInButton>
            </SignedOut>

            <SignedIn>
                <Link to="/dashboard">
                    <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                        {t('landing.cta')}
                    </button>
                </Link>
            </SignedIn>
        </div>
    );
}
