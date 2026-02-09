import { Platform } from 'react-native';
import { synchronize, type SyncPullArgs, type SyncPushArgs } from '@nozbe/watermelondb/sync';
import type { Database } from '@nozbe/watermelondb';
import * as SecureStore from 'expo-secure-store';

import { networkLogger } from '@/lib/loggers';

const SYNC_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

const COOKIE_STORE_KEY = 'laughtrack_cookie';

async function getAuthCookieHeader(): Promise<string> {
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

export async function performSync(database: Database): Promise<{ success: boolean; message: string }> {
  networkLogger.info('[Sync] Starting sync...');
  const startTime = Date.now();

  try {
    const cookie = await getAuthCookieHeader();

    await synchronize({
      database,
      sendCreatedAsUpdated: true,
      migrationsEnabledAtVersion: 1,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }: SyncPullArgs) => {
        const params = new URLSearchParams();
        if (lastPulledAt) params.set('last_pulled_at', String(lastPulledAt));
        params.set('schema_version', String(schemaVersion));
        if (migration) params.set('migration', JSON.stringify(migration));

        const url = `${SYNC_BASE_URL}/api/sync/pull?${params.toString()}`;
        networkLogger.debug('[Sync] Pull request:', url);

        const response = await fetch(url, {
          headers: { Cookie: cookie }
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Pull failed (${response.status}): ${text}`);
        }

        const result = await response.json();
        networkLogger.debug('[Sync] Pull complete, timestamp:', result.timestamp);
        return { changes: result.changes, timestamp: result.timestamp };
      },
      pushChanges: async ({ changes, lastPulledAt }: SyncPushArgs) => {
        networkLogger.debug('[Sync] Pushing changes...');

        const response = await fetch(`${SYNC_BASE_URL}/api/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookie
          },
          body: JSON.stringify({ changes, lastPulledAt })
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Push failed (${response.status}): ${text}`);
        }

        networkLogger.debug('[Sync] Push complete');
      }
    });

    const duration = Date.now() - startTime;
    networkLogger.info(`[Sync] Sync completed successfully in ${duration}ms`);
    return { success: true, message: `Synced in ${(duration / 1000).toFixed(1)}s` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    networkLogger.error('[Sync] Sync failed:', message);
    return { success: false, message };
  }
}
