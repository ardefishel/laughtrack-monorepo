import { Platform } from 'react-native';

import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

const COOKIE_STORE_KEY = 'laughtrack_cookie';

export async function getAuthCookieHeader(): Promise<string> {
  const raw = await SecureStore.getItemAsync(COOKIE_STORE_KEY);
  if (!raw) {
    throw new Error('No session found. Please sign in first.');
  }
  let parsed: Record<string, { value: string; expires: string | null }> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid session data. Please sign in again.');
  }
  const cookie = Object.entries(parsed)
    .filter(([, v]) => !v.expires || new Date(v.expires) > new Date())
    .map(([key, v]) => `${key}=${v.value}`)
    .join('; ');
  if (!cookie) {
    throw new Error('Session expired. Please sign in again.');
  }
  return cookie;
}

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
