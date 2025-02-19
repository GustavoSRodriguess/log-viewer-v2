import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        console.log('=== TOGGLE DO TEMA ===');
        console.log('1. Estado atual antes do toggle:', isDarkMode);

        setIsDarkMode(prev => {
            const newTheme = !prev;
            console.log('2. Novo estado após toggle:', newTheme);
            localStorage.setItem('theme', newTheme ? 'dark' : 'light');

            document.documentElement.classList.remove('dark');
            if (newTheme) {
                document.documentElement.classList.add('dark');
            }

            console.log('3. Classes após mudança:', document.documentElement.classList.toString());
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }
    return context;
};