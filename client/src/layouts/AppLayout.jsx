import { Outlet } from 'react-router-dom';
import { UserButton, SignInButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import WelcomeGuide from '../components/WelcomeGuide';
import { useGuest } from '../contexts/GuestContext';

export default function AppLayout() {
    const { isGuest } = useGuest();
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-end px-6 transition-colors">
                    {isGuest ? (
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                                {t('guest.signUp')}
                            </button>
                        </SignInButton>
                    ) : (
                        <UserButton />
                    )}
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
            {!isGuest && <WelcomeGuide />}
        </div>
    );
}
