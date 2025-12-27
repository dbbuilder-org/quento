/**
 * Jest Test Setup
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'http://test-api.example.com',
      storybookEnabled: false,
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ children }) => children),
  BottomSheetView: jest.fn().mockImplementation(({ children }) => children),
  BottomSheetBackdrop: jest.fn().mockImplementation(() => null),
}));

// Silence console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Animated: `useNativeDriver`')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
