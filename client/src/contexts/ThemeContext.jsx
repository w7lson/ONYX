import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    useEffect(() => {
        // Always dark — no toggle
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
}
