import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('wildbugs-theme') as Theme) || 'light',

  initTheme: () => {
    const saved = localStorage.getItem('wildbugs-theme') as Theme | null;
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initial);
    set({ theme: initial });
  },

  setTheme: (newTheme: Theme) => {
    localStorage.setItem('wildbugs-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
