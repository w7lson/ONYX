import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, Flame, Target, FileText, CheckCircle, Sparkles, Trash2 } from 'lucide-react';

const typeIcons = {
    streak:        Flame,
    goal_complete: Target,
    test_result:   FileText,
    milestone:     CheckCircle,
    welcome:       Sparkles,
    system:        Bell,
};

const typeColors = {
    streak:        'text-warning-600 bg-warning-50 dark:bg-warning-900/30',
    goal_complete: 'text-success-600 bg-success-50 dark:bg-success-900/30',
    test_result:   'text-primary-600 bg-primary-50 dark:bg-primary-950',
    milestone:     'text-primary-500 bg-primary-50 dark:bg-primary-950',
    welcome:       'text-warning-500 bg-warning-50 dark:bg-warning-900/30',
    system:        'text-slate-400 bg-white/[0.06]',
};

function timeAgo(dateStr, t) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return t('notifications.minutesAgo', { count: Math.max(1, minutes) });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('notifications.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    return t('notifications.daysAgo', { count: days });
}

function groupByDate(notifications, t) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const groups = { today: [], yesterday: [], earlier: [] };
    for (const n of notifications) {
        const dateStr = new Date(n.createdAt).toDateString();
        if (dateStr === today) groups.today.push(n);
        else if (dateStr === yesterday) groups.yesterday.push(n);
        else groups.earlier.push(n);
    }
    const result = [];
    if (groups.today.length)     result.push({ label: t('notifications.today'),     items: groups.today });
    if (groups.yesterday.length) result.push({ label: t('notifications.yesterday'), items: groups.yesterday });
    if (groups.earlier.length)   result.push({ label: t('notifications.earlier'),   items: groups.earlier });
    return result;
}

export default function Notifications() {
    const { getToken } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refreshUnreadCount } = useNotifications();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { Authorization: `Bearer ${token}` };
    }, [getToken]);

    const fetchNotifications = useCallback(async () => {
        try {
            const headers = await authHeaders();
            const res = await fetch('/api/notifications', { headers });
            if (res.ok) setNotifications(await res.json());
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const handleClick = async (notification) => {
        if (!notification.isRead) {
            try {
                const headers = await authHeaders();
                await fetch(`/api/notifications/${notification.id}/read`, { method: 'PATCH', headers });
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                refreshUnreadCount();
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
        if (notification.link) navigate(notification.link);
    };

    const handleMarkAllRead = async () => {
        try {
            const headers = await authHeaders();
            await fetch('/api/notifications/read-all', { method: 'PATCH', headers });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            refreshUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        try {
            const headers = await authHeaders();
            await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE', headers });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            refreshUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const groups = groupByDate(notifications, t);
    const hasUnread = notifications.some(n => !n.isRead);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {t('notifications.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">{t('notifications.subtitle')}</p>
                </div>
                {hasUnread && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors"
                    >
                        {t('notifications.markAllRead')}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">{t('dashboard.loading')}</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-[#161A22] border border-white/[0.06] rounded-2xl p-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
                        <Bell size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">{t('notifications.noNotifications')}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">{t('notifications.noNotificationsDesc')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groups.map(group => (
                        <div key={group.label}>
                            <h2 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.08em] mb-2 px-1">
                                {group.label}
                            </h2>
                            <div className="space-y-1.5">
                                {group.items.map(notification => {
                                    const Icon = typeIcons[notification.type] || Bell;
                                    const colorClass = typeColors[notification.type] || typeColors.system;

                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleClick(notification)}
                                            className={[
                                                'flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 cursor-pointer group',
                                                notification.isRead
                                                    ? 'bg-[#161A22] border-white/[0.06] hover:border-white/[0.10]'
                                                    : 'bg-green-500/5 border-green-500/20 hover:border-green-500/30',
                                            ].join(' ')}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-medium ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                    {timeAgo(notification.createdAt, t)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(e, notification.id)}
                                                aria-label="Delete notification"
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-error-500 transition-all"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
