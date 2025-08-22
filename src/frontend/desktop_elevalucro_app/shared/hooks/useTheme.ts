import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useThemeProvider = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Detectar preferência do sistema e carregar tema salvo
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme(systemPrefersDark ? 'dark' : 'light');
      }
    }
  }, []);

  // Aplicar tema ao HTML
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      const root = window.document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Salvar preferência
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    setTheme
  };
};