import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { getToken, isSignedIn } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!isSignedIn) return;
        try {
            const token = await getToken();
            const res = await fetch('/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [getToken, isSignedIn]);

    useEffect(() => {
        if (!isSignedIn) {
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();
        intervalRef.current = setInterval(fetchUnreadCount, 60000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isSignedIn, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount: fetchUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
}
