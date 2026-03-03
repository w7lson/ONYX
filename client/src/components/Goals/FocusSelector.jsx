import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Briefcase, DollarSign, Heart, GraduationCap, Users, Sparkles, Palette, Home } from 'lucide-react';

const FOCUS_CATEGORIES = [
    { key: 'careerWork', icon: Briefcase },
    { key: 'moneyFinance', icon: DollarSign },
    { key: 'healthFitness', icon: Heart },
    { key: 'educationLearning', icon: GraduationCap },
    { key: 'relationshipsSocial', icon: Users },
    { key: 'personalGrowth', icon: Sparkles },
    { key: 'hobbiesCreative', icon: Palette },
    { key: 'homeLiving', icon: Home },
];

export default function FocusSelector({ focus, onFocusChange }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLabel = focus === 'Uncategorized'
        ? t('goals.specify.uncategorizedFocus')
        : t(`goals.specify.focuses.${focus}`);

    return (
        <div ref={ref} className="relative w-full bg-[#161A22] border border-white/[0.06] rounded-xl px-5 py-3 mb-6">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">
                    {currentLabel}
                </span>
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                    {t('goals.specify.changeFocus')}
                    <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {open && (
                <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-[#1A1D24] border border-white/[0.08] rounded-xl shadow-lg p-4">
                    <div className="grid grid-cols-2 gap-2">
                        {FOCUS_CATEGORIES.map(({ key, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => {
                                    onFocusChange(key);
                                    setOpen(false);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                                    focus === key
                                        ? 'bg-primary-950/40 border border-primary-500/40 text-primary-300'
                                        : 'hover:bg-white/[0.04] text-slate-300'
                                }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm font-medium">{t(`goals.specify.focuses.${key}`)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
