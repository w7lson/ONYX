import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { User, Target, BarChart3, Eye, BookOpen, Gauge, CalendarClock, LogOut, Pencil, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PREFERENCE_OPTIONS = {
    primaryGoal: ['career', 'hobby', 'exam', 'personal', 'academic'],
    currentLevel: ['under1h', '1-2hours', '2-4hours', '4-6hours', '6plus'],
    learningStyle: ['visual', 'reading', 'handson'],
    preferredContent: ['videos', 'articles', 'interactive'],
    pace: ['intensive', 'moderate', 'relaxed'],
    reviewFrequency: ['daily', 'weekly', 'monthly'],
};

const PREFERENCE_ICONS = {
    primaryGoal: Target,
    currentLevel: BarChart3,
    learningStyle: Eye,
    preferredContent: BookOpen,
    pace: Gauge,
    reviewFrequency: CalendarClock,
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
                if (res.ok) {
                    setPreferences(await res.json());
                }
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
            if (res.ok) {
                const updated = await res.json();
                setPreferences(updated);
            }
        } catch (error) {
            console.error('Error updating preference:', error);
        }
        setEditingField(null);
        setEditValue('');
    };

    const handleSignOut = () => {
        signOut();
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {t('profile.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('profile.subtitle')}</p>

            {/* User Info Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4">
                    {user?.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt=""
                            className="w-16 h-16 rounded-full"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                            <User size={28} className="text-blue-600" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {user?.fullName || user?.firstName || t('profile.user')}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    {t('profile.preferences')}
                </h3>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">{t('profile.loading')}</p>
                ) : !preferences?.onboardingDone ? (
                    <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('profile.noPreferences')}</p>
                        <Link
                            to="/onboarding"
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            {t('profile.goToOnboarding')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {PREFERENCE_KEYS.map((field) => {
                            const Icon = PREFERENCE_ICONS[field];
                            const currentValue = preferences[field];
                            const isEditing = editingField === field;

                            return (
                                <div
                                    key={field}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                                >
                                    <Icon size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-36 flex-shrink-0">
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
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    {t(`quiz.${field}.${opt}`)}
                                                </button>
                                            ))}
                                            <div className="flex gap-1 ml-auto">
                                                <button
                                                    onClick={() => saveEdit(field, editValue)}
                                                    className="p-1 text-green-600 hover:text-green-700"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">
                                                {currentValue ? t(`quiz.${field}.${currentValue}`) : '—'}
                                            </span>
                                            <button
                                                onClick={() => startEditing(field)}
                                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Pencil size={14} />
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
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            >
                <LogOut size={18} />
                {t('profile.signOut')}
            </button>
        </div>
    );
}
