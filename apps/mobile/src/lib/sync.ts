import type { Database } from '@nozbe/watermelondb'
import { synchronize, type SyncPullArgs, type SyncPushArgs } from '@nozbe/watermelondb/sync'
import { Platform } from 'react-native'
import { getAuthCookieHeader } from '@/lib/auth-client'

const SYNC_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')

export async function performSync(database: Database): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now()

    try {
        const cookie = await getAuthCookieHeader()

        await synchronize({
            database,
            sendCreatedAsUpdated: true,
            pullChanges: async ({ lastPulledAt, schemaVersion, migration }: SyncPullArgs) => {
                const params = new URLSearchParams()
                if (lastPulledAt) params.set('last_pulled_at', String(lastPulledAt))
                params.set('schema_version', String(schemaVersion))
                if (migration) params.set('migration', JSON.stringify(migration))

                const url = `${SYNC_BASE_URL}/api/mobile/sync/pull?${params.toString()}`
                const response = await fetch(url, {
                    headers: { Cookie: cookie }
                })

                if (!response.ok) {
                    const text = await response.text()
                    throw new Error(`Pull failed (${response.status}): ${text}`)
                }

                const result = await response.json()
                return { changes: result.changes, timestamp: result.timestamp }
            },
            pushChanges: async ({ changes, lastPulledAt }: SyncPushArgs) => {
                const response = await fetch(`${SYNC_BASE_URL}/api/mobile/sync/push`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: cookie
                    },
                    body: JSON.stringify({ changes, lastPulledAt })
                })

                if (!response.ok) {
                    const text = await response.text()
                    throw new Error(`Push failed (${response.status}): ${text}`)
                }
            }
        })

        const duration = Date.now() - startTime
        return { success: true, message: `Synced in ${(duration / 1000).toFixed(1)}s` }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown sync error'
        return { success: false, message }
    }
}
