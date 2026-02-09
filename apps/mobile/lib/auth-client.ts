import { Platform } from 'react-native';

import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: 'laughtrack',
      storagePrefix: 'laughtrack',
      cookiePrefix: 'backend',
      storage: SecureStore
    })
  ]
});
