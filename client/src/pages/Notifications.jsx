import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, Flame, Target, FileText, CheckCircle, Sparkles, Trash2 } from 'lucide-react';

const typeIcons = {
    streak: Flame,
    goal_complete: Target,
    test_result: FileText,
    milestone: CheckCircle,
    welcome: Sparkles,
    system: Bell,
};

const typeColors = {
    streak: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
    goal_complete: 'text-green-500 bg-green-50 dark:bg-green-950',
    test_result: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
    milestone: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
    welcome: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    system: 'text-gray-500 bg-gray-50 dark:bg-gray-800',
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
    if (groups.today.length) result.push({ label: t('notifications.today'), items: groups.today });
    if (groups.yesterday.length) result.push({ label: t('notifications.yesterday'), items: groups.yesterday });
    if (groups.earlier.length) result.push({ label: t('notifications.earlier'), items: groups.earlier });
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

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleClick = async (notification) => {
        if (!notification.isRead) {
            try {
                const headers = await authHeaders();
                await fetch(`/api/notifications/${notification.id}/read`, {
                    method: 'PATCH',
                    headers,
                });
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
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
            await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers,
            });
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
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers,
            });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            refreshUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const groups = groupByDate(notifications, t);
    const hasUnread = notifications.some(n => !n.isRead);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {t('notifications.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('notifications.subtitle')}</p>
                </div>
                {hasUnread && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                    >
                        {t('notifications.markAllRead')}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('dashboard.loading')}</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <Bell size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">{t('notifications.noNotifications')}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">{t('notifications.noNotificationsDesc')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groups.map(group => (
                        <div key={group.label}>
                            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
                                {group.label}
                            </h2>
                            <div className="space-y-2">
                                {group.items.map(notification => {
                                    const Icon = typeIcons[notification.type] || Bell;
                                    const colorClass = typeColors[notification.type] || typeColors.system;

                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleClick(notification)}
                                            className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer group ${
                                                notification.isRead
                                                    ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                                            } hover:shadow-sm`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {timeAgo(notification.createdAt, t)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(e, notification.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={16} />
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
