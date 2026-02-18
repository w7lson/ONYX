import { SignInButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

export default function GuestRestrictionOverlay() {
    const { t } = useTranslation();

    return (
        <div className="max-w-md mx-auto mt-24 text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Lock size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('guest.restrictedTitle')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('guest.restrictedMessage')}
            </p>
            <SignInButton mode="modal">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    {t('guest.signUpCta')}
                </button>
            </SignInButton>
        </div>
    );
}
