import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Layers,
    Timer,
    FileQuestion,
    BarChart3,
    User,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const navSections = [
    {
        items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ],
    },
    {
        label: 'Learn',
        items: [
            { to: '/plans', icon: BookOpen, label: 'Plans' },
            { to: '/learning', icon: GraduationCap, label: 'Techniques' },
        ],
    },
    {
        label: 'Practice',
        items: [
            { to: '/flashcards', icon: Layers, label: 'Flashcards' },
            { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
            { to: '/tests', icon: FileQuestion, label: 'AI Tests' },
        ],
    },
    {
        label: 'Track',
        items: [
            { to: '/progress', icon: BarChart3, label: 'Progress' },
        ],
    },
];

const bottomItems = [
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const renderNavLink = ({ to, icon: Icon, label }) => (
        <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
            }
        >
            <Icon size={20} className="shrink-0" />
            {!collapsed && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                >
                    {label}
                </motion.span>
            )}
        </NavLink>
    );

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 240 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-screen bg-gray-900 text-white flex flex-col sticky top-0 overflow-hidden"
        >
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-lg font-bold whitespace-nowrap"
                    >
                        ONYX Study
                    </motion.span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors ml-auto"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
                {navSections.map((section, idx) => (
                    <div key={idx} className={idx > 0 ? 'mt-4' : ''}>
                        {section.label && !collapsed && (
                            <span className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 block">
                                {section.label}
                            </span>
                        )}
                        {section.label && collapsed && (
                            <div className="mx-3 mb-1 border-t border-gray-800" />
                        )}
                        <div className="flex flex-col gap-0.5">
                            {section.items.map(renderNavLink)}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-gray-800 py-3 px-2 flex flex-col gap-0.5">
                {bottomItems.map(renderNavLink)}
            </div>
        </motion.aside>
    );
}
