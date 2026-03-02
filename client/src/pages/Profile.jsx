import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { User, BarChart3, Eye, BookOpen, Gauge, CalendarClock, LogOut, Pencil, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PREFERENCE_OPTIONS = {
    currentLevel:     ['under1h', '1-2hours', '2-4hours', '4-6hours', '6plus'],
    learningStyle:    ['visual', 'reading', 'handson'],
    preferredContent: ['videos', 'articles', 'interactive'],
    pace:             ['intensive', 'moderate', 'relaxed'],
    reviewFrequency:  ['daily', 'weekly', 'monthly'],
};

const PREFERENCE_ICONS = {
    currentLevel:     BarChart3,
    learningStyle:    Eye,
    preferredContent: BookOpen,
    pace:             Gauge,
    reviewFrequency:  CalendarClock,
};

const PREFERENCE_KEYS = Object.keys(PREFERENCE_OPTIONS);

export default function Profile() {
    const { t } = useTranslation();
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk();

    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { Authorization: `Bearer ${token}` };
    }, [getToken]);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const headers = await authHeaders();
                const res = await fetch('/api/preferences', { headers });
                if (res.ok) setPreferences(await res.json());
            } catch (error) {
                console.error('Error fetching preferences:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, [authHeaders]);

    const startEditing = (field) => {
        setEditingField(field);
        setEditValue(preferences?.[field] || '');
    };

    const cancelEditing = () => {
        setEditingField(null);
        setEditValue('');
    };

    const saveEdit = async (field, value) => {
        try {
            const headers = await authHeaders();
            const res = await fetch('/api/preferences', {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });
            if (res.ok) setPreferences(await res.json());
        } catch (error) {
            console.error('Error updating preference:', error);
        }
        setEditingField(null);
        setEditValue('');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
                {t('profile.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t('profile.subtitle')}</p>

            {/* User Info */}
            <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-6 mb-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                <div className="flex items-center gap-4">
                    {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="" className="w-16 h-16 rounded-full" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                            <User size={28} className="text-primary-600 dark:text-primary-400" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {user?.fullName || user?.firstName || t('profile.user')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-6 mb-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {t('profile.preferences')}
                </h3>

                {loading ? (
                    <p className="text-slate-500 dark:text-slate-400">{t('profile.loading')}</p>
                ) : !preferences?.onboardingDone ? (
                    <div className="text-center py-6">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">{t('profile.noPreferences')}</p>
                        <Link
                            to="/onboarding"
                            className="px-5 py-2.5 bg-primary-600 text-white rounded-[10px] font-medium hover:bg-primary-700 transition-colors"
                        >
                            {t('profile.goToOnboarding')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {PREFERENCE_KEYS.map((field) => {
                            const Icon = PREFERENCE_ICONS[field];
                            const currentValue = preferences[field];
                            const isEditing = editingField === field;

                            return (
                                <div
                                    key={field}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]"
                                >
                                    <Icon size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-36 shrink-0">
                                        {t(`profile.${field}`)}
                                    </span>

                                    {isEditing ? (
                                        <div className="flex-1 flex items-center gap-2 flex-wrap">
                                            {PREFERENCE_OPTIONS[field].map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setEditValue(opt)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                        editValue === opt
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                                    }`}
                                                >
                                                    {t(`quiz.${field}.${opt}`)}
                                                </button>
                                            ))}
                                            <div className="flex gap-1 ml-auto">
                                                <button onClick={() => saveEdit(field, editValue)} className="p-1.5 text-success-600 hover:text-success-700 transition-colors">
                                                    <Check size={15} />
                                                </button>
                                                <button onClick={cancelEditing} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-sm text-slate-900 dark:text-slate-100">
                                                {currentValue ? t(`quiz.${field}.${currentValue}`) : '—'}
                                            </span>
                                            <button
                                                onClick={() => startEditing(field)}
                                                className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sign Out */}
            <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-error-200 dark:border-error-900 bg-error-50 dark:bg-error-950/30 text-error-600 dark:text-error-400 rounded-2xl font-semibold hover:bg-error-100 dark:hover:bg-error-950/50 transition-colors"
            >
                <LogOut size={17} />
                {t('profile.signOut')}
            </button>
        </div>
    );
}
