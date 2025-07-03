import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  // Initialize theme from localStorage or default to dark
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('contentflow-theme') as Theme | null;
    return savedTheme || defaultTheme;
  });

  // Apply theme class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('light', 'dark');
    root.removeAttribute('data-theme');
    
    if (theme === 'light') {
      // For light mode, remove dark class
      root.setAttribute('data-theme', 'light');
      // Don't add any class - light mode is default in our new setup
    } else {
      // For dark mode, add dark class
      root.classList.add('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('contentflow-theme', theme);
    
    // Update CSS variables
    updateCSSVariables(theme);
  }, [theme]);

  // Update CSS custom properties based on theme
  const updateCSSVariables = (currentTheme: Theme) => {
    const root = document.documentElement;
    
    if (currentTheme === 'dark') {
      // Dark theme variables
      root.style.setProperty('--bg-primary', '#0b1215');
      root.style.setProperty('--bg-secondary', '#141922');
      root.style.setProperty('--bg-tertiary', '#1e2530');
      root.style.setProperty('--bg-hover', '#28313d');
      root.style.setProperty('--bg-elevated', '#2a3441');
      root.style.setProperty('--border-color', '#353f4f');
      
      root.style.setProperty('--text-primary', '#f7f8fa');
      root.style.setProperty('--text-secondary', '#b8c0cc');
      root.style.setProperty('--text-tertiary', '#8892a0');
      root.style.setProperty('--text-disabled', '#525966');
      root.style.setProperty('--text-muted', '#6b7785');
      
      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0,0,0,0.25), 0 0 4px rgba(255,255,255,0.02)');
      root.style.setProperty('--shadow-md', '0 8px 16px rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.04)');
      root.style.setProperty('--shadow-lg', '0 16px 32px rgba(0,0,0,0.4), 0 0 16px rgba(255,255,255,0.05)');
    } else {
      // Light theme variables
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F9FAFB');
      root.style.setProperty('--bg-tertiary', '#F3F4F6');
      root.style.setProperty('--bg-hover', '#E5E7EB');
      root.style.setProperty('--bg-elevated', '#FFFFFF');
      root.style.setProperty('--border-color', '#D1D5DB');
      
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#374151');
      root.style.setProperty('--text-tertiary', '#6B7280');
      root.style.setProperty('--text-disabled', '#9CA3AF');
      root.style.setProperty('--text-muted', '#D1D5DB');
      
      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0,0,0,0.05)');
      root.style.setProperty('--shadow-md', '0 8px 16px rgba(0,0,0,0.15)');
      root.style.setProperty('--shadow-lg', '0 16px 32px rgba(0,0,0,0.2)');
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't set a preference
      if (!localStorage.getItem('contentflow-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Keyboard shortcut for theme toggle (Cmd/Ctrl + Shift + L)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};