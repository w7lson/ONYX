import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Bell, User, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WelcomeGuide from '../components/WelcomeGuide';
import { useNotifications } from '../contexts/NotificationContext';

export default function AppLayout() {
    const { unreadCount } = useNotifications();
    const { user } = useUser();
    const navigate = useNavigate();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#0C0E12]">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-medium"
            >
                Skip to content
            </a>
            <Sidebar
                isMobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-[#111318] border-b border-white/[0.06] flex items-center px-4 shrink-0">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="md:hidden p-2 -ml-1 mr-2 rounded-lg text-gray-500 hover:text-white transition-colors"
                        aria-label="Open navigation menu"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Right side actions */}
                    <div className="ml-auto flex items-center gap-3">
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

                        {/* Avatar → /profile */}
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-primary-500/50 transition-all"
                            aria-label="Go to profile"
                        >
                            {user?.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.fullName || 'Profile'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-primary-600/30 flex items-center justify-center">
                                    <User size={14} className="text-primary-400" />
                                </div>
                            )}
                        </button>
                    </div>
                </header>
                <main id="main-content" className="flex-1 p-4 sm:p-6 overflow-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            <WelcomeGuide />
        </div>
    );
}
