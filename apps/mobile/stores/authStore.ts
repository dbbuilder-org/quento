/**
 * Auth Store - Clerk Authentication wrapper
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { create } from 'zustand';
import { useAuth, useUser } from '@clerk/clerk-expo';

// User interface for the app
export interface User {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  imageUrl?: string;
}

// Simple store for app-specific auth state
interface AuthState {
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isInitialized: false,
  setInitialized: (value: boolean) => set({ isInitialized: value }),
}));

// Hook to get current user from Clerk
export function useCurrentUser(): User | null {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    fullName: user.fullName || undefined,
    companyName: (user.unsafeMetadata?.companyName as string) || undefined,
    imageUrl: user.imageUrl,
  };
}

// Hook to get auth token for API calls
export function useClerkToken() {
  const { getToken } = useAuth();
  return getToken;
}
