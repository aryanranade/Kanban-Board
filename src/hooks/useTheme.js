import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'kanban-theme';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem(THEME_KEY) || 'dark';
        } catch {
            return 'dark';
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            console.warn('Failed to save theme preference:', e);
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, toggleTheme };
}
