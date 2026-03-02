import type { Database } from '@nozbe/watermelondb'
import { synchronize, type SyncPullArgs, type SyncPushArgs } from '@nozbe/watermelondb/sync'
import { Platform } from 'react-native'
import { getAuthCookieHeader } from '@/lib/auth-client'
import { syncLogger } from '@/lib/loggers'

const SYNC_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')

function countChanges(changes: Record<string, { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] }>): string {
    return Object.entries(changes)
        .map(([table, { created = [], updated = [], deleted = [] }]) => {
            const parts: string[] = []
            if (created.length) parts.push(`+${created.length}`)
            if (updated.length) parts.push(`~${updated.length}`)
            if (deleted.length) parts.push(`-${deleted.length}`)
            return parts.length ? `${table}(${parts.join(',')})` : null
        })
        .filter(Boolean)
        .join(' ') || 'no changes'
}

export async function performSync(database: Database): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now()
    syncLogger.info('Sync started')

    try {
        const cookie = await getAuthCookieHeader()

        await synchronize({
            database,
            sendCreatedAsUpdated: true,
            pullChanges: async ({ lastPulledAt, schemaVersion, migration }: SyncPullArgs) => {
                const pullStart = Date.now()
                const params = new URLSearchParams()
                if (lastPulledAt) params.set('last_pulled_at', String(lastPulledAt))
                params.set('schema_version', String(schemaVersion))
                if (migration) params.set('migration', JSON.stringify(migration))

                const url = `${SYNC_BASE_URL}/api/mobile/sync/pull?${params.toString()}`
                syncLogger.debug(`Pull request — lastPulledAt: ${lastPulledAt ?? 'initial'}`)

                const response = await fetch(url, {
                    headers: { Cookie: cookie }
                })

                if (!response.ok) {
                    const text = await response.text()
                    syncLogger.error(`Pull failed (${response.status}): ${text}`)
                    throw new Error(`Pull failed (${response.status}): ${text}`)
                }

                const result = await response.json()
                const pullMs = Date.now() - pullStart
                syncLogger.info(`Pull OK in ${pullMs}ms — ${countChanges(result.changes)}`)
                return { changes: result.changes, timestamp: result.timestamp }
            },
            pushChanges: async ({ changes, lastPulledAt }: SyncPushArgs) => {
                const pushStart = Date.now()
                syncLogger.debug(`Push request — ${countChanges(changes as Record<string, { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] }>)}`)

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
                    syncLogger.error(`Push failed (${response.status}): ${text}`)
                    throw new Error(`Push failed (${response.status}): ${text}`)
                }

                const pushMs = Date.now() - pushStart
                syncLogger.info(`Push OK in ${pushMs}ms`)
            }
        })

        const duration = Date.now() - startTime
        syncLogger.info(`Sync completed in ${(duration / 1000).toFixed(1)}s`)
        return { success: true, message: `Synced in ${(duration / 1000).toFixed(1)}s` }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown sync error'
        syncLogger.error('Sync failed:', message)
        return { success: false, message }
    }
}
