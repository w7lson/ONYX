import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard, BookOpen, GraduationCap, Layers,
    Timer, FileQuestion, Target, User, Settings,
    BarChart3, ChevronLeft, ChevronRight, Globe, X,
} from 'lucide-react';

const navSections = [
    {
        items: [
            { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
        ],
    },
    {
        labelKey: 'sections.learn',
        items: [
            { to: '/plans',    icon: BookOpen,      labelKey: 'nav.plans'      },
            { to: '/learning', icon: GraduationCap, labelKey: 'nav.techniques' },
        ],
    },
    {
        labelKey: 'sections.practice',
        items: [
            { to: '/flashcards', icon: Layers,       labelKey: 'nav.flashcards' },
            { to: '/pomodoro',   icon: Timer,        labelKey: 'nav.pomodoro'   },
            { to: '/tests',      icon: FileQuestion, labelKey: 'nav.tests'      },
        ],
    },
    {
        labelKey: 'sections.track',
        items: [
            { to: '/goals',    icon: Target,   labelKey: 'nav.goals'    },
            { to: '/progress', icon: BarChart3, labelKey: 'nav.progress' },
        ],
    },
];

const languages = [
    { code: 'en', label: 'English' },
    { code: 'uk', label: 'Українська' },
    { code: 'de', label: 'Deutsch' },
];

export default function Sidebar({ isMobileOpen, onMobileClose }) {
    const [collapsed, setCollapsed] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );
    const { t, i18n } = useTranslation();
    const accountRef = useRef(null);

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    // Close account/lang popup on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountOpen(false);
                setLangOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobile && isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobile, isMobileOpen]);

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('language', code);
        setLangOpen(false);
        setAccountOpen(false);
    };

    const handleNavClick = () => {
        if (isMobile) {
            setAccountOpen(false);
            onMobileClose();
        }
    };

    const showLabels = !collapsed || isMobile;

    const renderNavLink = ({ to, icon: Icon, labelKey }) => (
        <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl transition-all duration-150 whitespace-nowrap ${
                    isActive
                        ? 'text-white'
                        : 'text-gray-500 hover:text-white'
                }`
            }
        >
            <span className="relative shrink-0">
                <Icon size={20} />
            </span>
            {showLabels && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[15px] font-medium"
                >
                    {t(labelKey)}
                </motion.span>
            )}
        </NavLink>
    );

    return (
        <>
            {/* Mobile backdrop */}
            {isMobile && (
                <div
                    className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
                        isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                    onClick={onMobileClose}
                />
            )}

            <motion.aside
                animate={
                    isMobile
                        ? { x: isMobileOpen ? 0 : '-100%', width: '100%' }
                        : { x: 0, width: collapsed ? 64 : 240 }
                }
                initial={false}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={[
                    'h-[100dvh] bg-[#111318] border-r border-white/[0.06] flex flex-col shrink-0',
                    isMobile
                        ? 'fixed inset-y-0 left-0 z-50'
                        : 'sticky top-0',
                ].join(' ')}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06] shrink-0 overflow-hidden">
                    {showLabels && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-lg font-bold text-green-400 whitespace-nowrap tracking-tight"
                        >
                            {t('brand')}
                        </motion.span>
                    )}
                    {isMobile ? (
                        <button
                            onClick={onMobileClose}
                            aria-label="Close sidebar"
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors ml-auto shrink-0"
                        >
                            <X size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors ml-auto shrink-0"
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav
                    role="navigation"
                    aria-label="Main navigation"
                    className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto overflow-x-hidden"
                >
                    {navSections.map((section, idx) => (
                        <div key={idx} className={idx > 0 ? 'mt-4' : ''}>
                            {section.labelKey && showLabels && (
                                <span className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600 block whitespace-nowrap">
                                    {t(section.labelKey)}
                                </span>
                            )}
                            {section.labelKey && collapsed && !isMobile && (
                                <div className="mx-3 mb-2 border-t border-white/[0.06]" />
                            )}
                            <div className="flex flex-col gap-0.5">
                                {section.items.map(renderNavLink)}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom — account menu */}
                <div className="py-3 px-2 flex flex-col gap-0.5 shrink-0">
                    <div ref={accountRef} className="relative">
                        <button
                            onClick={() => { setAccountOpen(v => !v); setLangOpen(false); }}
                            className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.12] transition-all duration-150 whitespace-nowrap ${
                                accountOpen ? 'text-white bg-white/[0.04]' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
                            }`}
                        >
                            <div className="shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <User size={12} className="text-green-400" />
                            </div>
                            {showLabels && (
                                <>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[15px] font-medium flex-1 text-left"
                                    >
                                        My Account
                                    </motion.span>
                                    <ChevronRight
                                        size={14}
                                        className={`text-gray-600 transition-transform duration-200 shrink-0 ${accountOpen ? 'rotate-90' : ''}`}
                                    />
                                </>
                            )}
                        </button>

                        {/* Account popup */}
                        {accountOpen && (
                            <div
                                className={`absolute z-50 bg-[#1A1D24] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden
                                    ${collapsed && !isMobile
                                        ? 'left-full ml-2 bottom-0 w-44'
                                        : 'bottom-full mb-2 left-0 right-0'
                                    }`}
                            >
                                <NavLink
                                    to="/profile"
                                    onClick={() => { setAccountOpen(false); if (isMobile) onMobileClose(); }}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors rounded-t-xl"
                                >
                                    <User size={13} />
                                    Profile
                                </NavLink>
                                <NavLink
                                    to="/settings"
                                    onClick={() => { setAccountOpen(false); if (isMobile) onMobileClose(); }}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <Settings size={13} />
                                    Settings
                                </NavLink>

                                {/* Language row */}
                                <button
                                    onClick={() => setLangOpen(v => !v)}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors rounded-b-xl cursor-pointer"
                                >
                                    <Globe size={13} />
                                    <span className="flex-1 text-left">Language</span>
                                    <ChevronRight
                                        size={12}
                                        className={`text-gray-600 transition-transform duration-200 ${langOpen ? 'rotate-90' : ''}`}
                                    />
                                </button>
                            </div>
                        )}

                        {/* Language popup */}
                        {accountOpen && langOpen && (
                            <div
                                className={`absolute z-50 bg-[#1A1D24] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden w-40
                                    ${collapsed && !isMobile
                                        ? 'left-full ml-2 bottom-0'
                                        : 'bottom-full mb-2 left-full ml-1'
                                    }`}
                            >
                                {languages.map(({ code, label }) => (
                                    <button
                                        key={code}
                                        onClick={() => changeLanguage(code)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                                            i18n.language === code
                                                ? 'text-green-400 bg-green-500/10'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {label}
                                        {i18n.language === code && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
