import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,

  login: (user: User, token: string) => {
    localStorage.setItem('token', token);
    set({ user, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoading: false });
  },

  loadFromStorage: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data.user, token, isLoading: false });
    } catch (err) {
      console.error('Failed to restore session from token:', err);
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  isAuthenticated: () => {
    return !!get().token && !!get().user;
  },
}));
