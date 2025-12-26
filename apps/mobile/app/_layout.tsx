/**
 * Root Layout - Quento Mobile App
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, Text } from 'react-native';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { initSentry, ErrorBoundary, setContext } from '../services/sentry';
import { COLORS } from '../constants/theme';
import { setClerkTokenGetter } from '../services/api';

// Initialize Sentry on app load
initSentry();

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = 'pk_test_c3Ryb25nLXBvbGxpd29nLTc2LmNsZXJrLmFjY291bnRzLmRldiQ';

// Token cache for Clerk using SecureStore
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore save errors
    }
  },
};

// Error fallback component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: COLORS.pure,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>😔</Text>
      <Text style={{
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.carbon,
        marginBottom: 8,
        textAlign: 'center',
      }}>
        Something went wrong
      </Text>
      <Text style={{
        fontSize: 16,
        color: COLORS.bark,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        We've been notified and are working on a fix.
      </Text>
      <Text style={{
        fontSize: 12,
        color: COLORS.bark,
        fontFamily: 'monospace',
      }}>
        {error.message}
      </Text>
    </View>
  );
}

// Inner component that sets up auth token getter
function AuthenticatedApp() {
  const colorScheme = useColorScheme();
  const { getToken } = useAuth();

  // Set up the token getter for API calls
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  // Set device context for Sentry
  useEffect(() => {
    setContext('device', {
      colorScheme,
    });
  }, [colorScheme]);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
          },
          headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#1A1A1A',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AuthenticatedApp />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
