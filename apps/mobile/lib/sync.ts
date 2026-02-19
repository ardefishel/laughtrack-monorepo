import type { Database } from '@nozbe/watermelondb';
import { synchronize, type SyncPullArgs, type SyncPushArgs } from '@nozbe/watermelondb/sync';
import { Platform } from 'react-native';

import { downloadMissingRecordings, fixLocalFilePaths, uploadPendingRecordings } from '@/lib/audioSync';
import { getAuthCookieHeader } from '@/lib/auth-client';
import { networkLogger } from '@/lib/loggers';

const SYNC_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

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

        const url = `${SYNC_BASE_URL}/api/mobile/sync/pull?${params.toString()}`;
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

        const response = await fetch(`${SYNC_BASE_URL}/api/mobile/sync/push`, {
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

    try {
      networkLogger.info('[Sync] Starting audio file sync...');
      await fixLocalFilePaths(database);
      const [uploadResult, downloadResult] = await Promise.allSettled([
        uploadPendingRecordings(database),
        downloadMissingRecordings(database)
      ]);
      if (uploadResult.status === 'fulfilled') {
        networkLogger.info(
          `[Sync] Audio uploads: ${uploadResult.value.uploaded} uploaded, ${uploadResult.value.failed} failed`
        );
      }
      if (downloadResult.status === 'fulfilled') {
        networkLogger.info(
          `[Sync] Audio downloads: ${downloadResult.value.downloaded} downloaded, ${downloadResult.value.failed} failed, ${downloadResult.value.skipped} skipped`
        );
      }
    } catch (audioError) {
      networkLogger.error('[Sync] Audio file sync failed (DB sync was successful):', audioError);
    }

    const duration = Date.now() - startTime;
    networkLogger.info(`[Sync] Sync completed successfully in ${duration}ms`);
    return { success: true, message: `Synced in ${(duration / 1000).toFixed(1)}s` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    networkLogger.error('[Sync] Sync failed:', message);
    return { success: false, message };
  }
}
