/**
 * Auth Store - Authentication state management
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setTokens, clearTokens, User as ApiUser } from '../services/api';
import { setUser as setSentryUser, addBreadcrumb, captureException } from '../services/sentry';

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
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  restoreSession: () => void;
}

// Convert API user to store user format
function mapApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.full_name || undefined,
    companyName: apiUser.company_name || undefined,
    currentRing: apiUser.current_ring,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        addBreadcrumb('Login attempt', 'user', { email });

        try {
          const response = await authApi.login(email, password);

          if (response.success && response.data) {
            const { user, tokens } = response.data;
            const mappedUser = mapApiUser(user);

            // Set Sentry user context
            setSentryUser({
              id: user.id,
              email: user.email,
              name: user.full_name || undefined,
            });

            addBreadcrumb('Login successful', 'user', { userId: user.id });

            set({
              user: mappedUser,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          captureException(error instanceof Error ? error : new Error(message), { email });
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      register: async (email: string, password: string, fullName: string, companyName?: string) => {
        set({ isLoading: true, error: null });
        addBreadcrumb('Registration attempt', 'user', { email });

        try {
          const response = await authApi.register(email, password, fullName, companyName);

          if (response.success && response.data) {
            const { user, tokens } = response.data;
            const mappedUser = mapApiUser(user);

            // Set Sentry user context
            setSentryUser({
              id: user.id,
              email: user.email,
              name: user.full_name || undefined,
            });

            addBreadcrumb('Registration successful', 'user', { userId: user.id });

            set({
              user: mappedUser,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Registration failed');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          captureException(error instanceof Error ? error : new Error(message), { email });
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      logout: async () => {
        addBreadcrumb('Logout', 'user');

        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors, still clear local state
        } finally {
          // Clear Sentry user context
          setSentryUser(null);
          clearTokens();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.login('', ''); // Token refresh is handled internally
          if (response.success && response.data) {
            set({
              accessToken: response.data.tokens.access_token,
              refreshToken: response.data.tokens.refresh_token,
            });
          }
        } catch {
          // If refresh fails, logout
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Restore session from persisted storage
      restoreSession: () => {
        const { accessToken, refreshToken } = get();
        if (accessToken && refreshToken) {
          setTokens(accessToken, refreshToken);
        }
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
      onRehydrateStorage: () => (state) => {
        // Restore API tokens when store rehydrates
        if (state?.accessToken && state?.refreshToken) {
          setTokens(state.accessToken, state.refreshToken);
        }
      },
    }
  )
);
