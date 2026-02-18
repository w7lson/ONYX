import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const GuestContext = createContext();

export function GuestProvider({ children }) {
    const [isGuest, setIsGuest] = useState(false);
    const [guestPlan, setGuestPlan] = useState(null);
    const { isSignedIn } = useAuth();

    // Auto-exit guest mode when user signs in
    useEffect(() => {
        if (isSignedIn && isGuest) {
            setIsGuest(false);
            setGuestPlan(null);
        }
    }, [isSignedIn, isGuest]);

    const enterGuestMode = useCallback(() => {
        setIsGuest(true);
    }, []);

    const exitGuestMode = useCallback(() => {
        setIsGuest(false);
        setGuestPlan(null);
    }, []);

    return (
        <GuestContext.Provider value={{ isGuest, guestPlan, setGuestPlan, enterGuestMode, exitGuestMode }}>
            {children}
        </GuestContext.Provider>
    );
}

export function useGuest() {
    const context = useContext(GuestContext);
    if (!context) throw new Error('useGuest must be used within GuestProvider');
    return context;
}
