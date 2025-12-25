/**
 * Auth Store - Authentication state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  currentRing: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // API call would go here
          // const response = await api.post('/auth/login', { email, password });

          // Mock response for development
          const mockUser: User = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            email,
            fullName: 'Demo User',
            currentRing: 1,
          };

          set({
            user: mockUser,
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, fullName: string, companyName?: string) => {
        set({ isLoading: true });
        try {
          // API call would go here
          // const response = await api.post('/auth/register', { email, password, fullName, companyName });

          // Mock response for development
          const mockUser: User = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            email,
            fullName,
            companyName,
            currentRing: 1,
          };

          set({
            user: mockUser,
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // API call would go here
        // const response = await api.post('/auth/refresh', { refresh_token: refreshToken });

        set({
          accessToken: 'new_mock_access_token',
        });
      },
    }),
    {
      name: 'quento-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
