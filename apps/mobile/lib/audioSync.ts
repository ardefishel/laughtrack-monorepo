import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';
import * as SecureStore from 'expo-secure-store';

import { AudioRecording, AUDIO_RECORDINGS_TABLE } from '@/models/AudioRecording';
import { getAudioPathForRecording, ensureAudioDirectory } from '@/lib/audioStorage';
import { createNamespacedLogger } from '@/lib/loggers';

const syncLogger = createNamespacedLogger('network');

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

export async function uploadPendingRecordings(
  database: Database
): Promise<{ uploaded: number; failed: number }> {
  syncLogger.info('[AudioSync] Starting upload of pending recordings...');
  let uploaded = 0;
  let failed = 0;

  try {
    const cookie = await getAuthCookieHeader();
    const recordings = await database
      .get<AudioRecording>(AUDIO_RECORDINGS_TABLE)
      .query(Q.or(Q.where('remote_url', Q.eq(null)), Q.where('remote_url', '')))
      .fetch();

    syncLogger.info(`[AudioSync] Found ${recordings.length} recordings to upload`);

    for (const recording of recordings) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(recording.filePath);
        if (!fileInfo.exists) {
          syncLogger.warn(`[AudioSync] Local file missing for recording ${recording.id}, skipping upload`);
          failed++;
          continue;
        }

        const response = await fetch(`${SYNC_BASE_URL}/api/audio/upload-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ recordingId: recording.id })
        });

        if (!response.ok) {
          const text = await response.text();
          syncLogger.error(`[AudioSync] Failed to get upload URL for ${recording.id}: ${text}`);
          failed++;
          continue;
        }

        const { url, key } = await response.json();

        const uploadResult = await FileSystem.uploadAsync(url, recording.filePath, {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: { 'Content-Type': 'audio/mp4' }
        });

        if (uploadResult.status >= 200 && uploadResult.status < 300) {
          const confirmResponse = await fetch(`${SYNC_BASE_URL}/api/audio/confirm-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            body: JSON.stringify({ recordingId: recording.id, key })
          });

          if (!confirmResponse.ok) {
            const confirmText = await confirmResponse.text();
            syncLogger.error(`[AudioSync] Failed to confirm upload for ${recording.id}: ${confirmText}`);
          }

          await database.write(async () => {
            await recording.update((r) => {
              r.remoteUrl = key;
            });
          });
          syncLogger.info(`[AudioSync] Uploaded recording ${recording.id}`);
          uploaded++;
        } else {
          syncLogger.error(`[AudioSync] Upload failed for ${recording.id}: status ${uploadResult.status}`);
          failed++;
        }
      } catch (error) {
        syncLogger.error(`[AudioSync] Error uploading recording ${recording.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    syncLogger.error('[AudioSync] Upload process failed:', error);
  }

  syncLogger.info(`[AudioSync] Upload complete: ${uploaded} uploaded, ${failed} failed`);
  return { uploaded, failed };
}

export async function downloadMissingRecordings(
  database: Database
): Promise<{ downloaded: number; failed: number; skipped: number }> {
  syncLogger.info('[AudioSync] Starting download of missing recordings...');
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  try {
    const cookie = await getAuthCookieHeader();
    await ensureAudioDirectory();

    const recordings = await database
      .get<AudioRecording>(AUDIO_RECORDINGS_TABLE)
      .query(Q.and(Q.where('remote_url', Q.notEq(null)), Q.where('remote_url', Q.notEq(''))))
      .fetch();

    syncLogger.info(`[AudioSync] Found ${recordings.length} recordings with remote URLs`);

    for (const recording of recordings) {
      try {
        const expectedPath = getAudioPathForRecording(recording.id);
        const fileInfo = await FileSystem.getInfoAsync(expectedPath);

        if (fileInfo.exists) {
          if (recording.filePath !== expectedPath) {
            await database.write(async () => {
              await recording.update((r) => {
                r.filePath = expectedPath;
              });
            });
          }
          skipped++;
          continue;
        }

        const response = await fetch(`${SYNC_BASE_URL}/api/audio/download-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ recordingId: recording.id })
        });

        if (!response.ok) {
          const text = await response.text();
          syncLogger.error(`[AudioSync] Failed to get download URL for ${recording.id}: ${text}`);
          failed++;
          continue;
        }

        const { url } = await response.json();

        const downloadResult = await FileSystem.downloadAsync(url, expectedPath);

        if (downloadResult.status >= 200 && downloadResult.status < 300) {
          await database.write(async () => {
            await recording.update((r) => {
              r.filePath = expectedPath;
            });
          });
          syncLogger.info(`[AudioSync] Downloaded recording ${recording.id}`);
          downloaded++;
        } else {
          syncLogger.error(`[AudioSync] Download failed for ${recording.id}: status ${downloadResult.status}`);
          failed++;
        }
      } catch (error) {
        syncLogger.error(`[AudioSync] Error downloading recording ${recording.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    syncLogger.error('[AudioSync] Download process failed:', error);
  }

  syncLogger.info(`[AudioSync] Download complete: ${downloaded} downloaded, ${failed} failed, ${skipped} skipped`);
  return { downloaded, failed, skipped };
}

export async function fixLocalFilePaths(database: Database): Promise<number> {
  syncLogger.info('[AudioSync] Fixing local file paths...');
  let fixed = 0;

  try {
    const recordings = await database
      .get<AudioRecording>(AUDIO_RECORDINGS_TABLE)
      .query()
      .fetch();

    for (const recording of recordings) {
      const expectedPath = getAudioPathForRecording(recording.id);
      if (!recording.filePath || recording.filePath !== expectedPath) {
        await database.write(async () => {
          await recording.update((r) => {
            r.filePath = expectedPath;
          });
        });
        fixed++;
      }
    }
  } catch (error) {
    syncLogger.error('[AudioSync] Failed to fix file paths:', error);
  }

  syncLogger.info(`[AudioSync] Fixed ${fixed} file paths`);
  return fixed;
}
