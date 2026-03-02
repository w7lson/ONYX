import { Outlet, NavLink } from 'react-router-dom';
import { UserButton, SignInButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WelcomeGuide from '../components/WelcomeGuide';
import { useGuest } from '../contexts/GuestContext';
import { useNotifications } from '../contexts/NotificationContext';

export default function AppLayout() {
    const { isGuest } = useGuest();
    const { t } = useTranslation();
    const { unreadCount } = useNotifications();

    return (
        <div className="flex min-h-screen bg-[#0C0E12]">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-medium"
            >
                Skip to content
            </a>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-[#111318] border-b border-white/[0.06] flex items-center justify-end gap-3 px-6 shrink-0">
                    {isGuest ? (
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-[10px] font-medium text-[15px] hover:bg-primary-700 transition-colors">
                                {t('guest.signUp')}
                            </button>
                        </SignInButton>
                    ) : (
                        <>
                            <NavLink
                                to="/notifications"
                                className="relative p-2 rounded-lg text-gray-500 hover:text-white transition-colors"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </NavLink>
                            <UserButton />
                        </>
                    )}
                </header>
                <main id="main-content" className="flex-1 p-6 overflow-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            {!isGuest && <WelcomeGuide />}
        </div>
    );
}
