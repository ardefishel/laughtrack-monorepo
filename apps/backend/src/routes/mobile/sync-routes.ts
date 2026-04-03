import { and, eq, gt } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../db/index'
import { bits, notes, premises, setlists } from '../../db/schema'
import { requireAuth } from '../../middlewares/auth'

const syncRoutes = new Hono()

const SYNC_TABLES = {
    notes,
    bits,
    premises,
    setlists,
} as const

type SyncTableName = keyof typeof SYNC_TABLES

const ALLOWED_FIELDS: Record<SyncTableName, Set<string>> = {
    notes: new Set(['id', 'content', 'created_at', 'updated_at']),
    bits: new Set(['id', 'content', 'status', 'tags_json', 'premise_id', 'setlist_ids_json', 'created_at', 'updated_at']),
    premises: new Set(['id', 'content', 'status', 'attitude', 'tags_json', 'bit_ids_json', 'source_note_id', 'created_at', 'updated_at']),
    setlists: new Set(['id', 'description', 'items_json', 'tags_json', 'created_at', 'updated_at']),
}

function sanitizeRecord(record: Record<string, unknown>, tableName: SyncTableName): Record<string, unknown> {
    const allowed = ALLOWED_FIELDS[tableName]
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(record)) {
        if (allowed.has(key)) {
            sanitized[key] = value
        }
    }
    return sanitized
}

const CAMEL_TO_SNAKE: Record<string, string> = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tagsJson: 'tags_json',
    premiseId: 'premise_id',
    setlistIdsJson: 'setlist_ids_json',
    bitIdsJson: 'bit_ids_json',
    sourceNoteId: 'source_note_id',
    itemsJson: 'items_json',
}

const SNAKE_TO_CAMEL: Record<string, string> = Object.fromEntries(
    Object.entries(CAMEL_TO_SNAKE).map(([camel, snake]) => [snake, camel])
)

const INTERNAL_CAMEL_FIELDS = ['userId', 'serverCreatedAt', 'lastModified', 'isDeleted'] as const
const INTERNAL_SNAKE_FIELDS = ['_status', '_changed'] as const

function drizzleToCamelRecord(record: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(record)) {
        if ((INTERNAL_CAMEL_FIELDS as readonly string[]).includes(key)) continue
        const snakeKey = CAMEL_TO_SNAKE[key] ?? key
        result[snakeKey] = value
    }
    return result
}

function snakeToDrizzleRecord(record: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(record)) {
        if ((INTERNAL_SNAKE_FIELDS as readonly string[]).includes(key)) continue
        const camelKey = SNAKE_TO_CAMEL[key] ?? key
        result[camelKey] = value
    }
    return result
}

type SyncTable = typeof notes | typeof bits | typeof premises | typeof setlists

async function pullTable(table: SyncTable, userId: string, lastPulledAt: Date | null) {
    if (!lastPulledAt) {
        const allRecords = await db
            .select()
            .from(table)
            .where(and(eq(table.userId, userId), eq(table.isDeleted, false)))
        return {
            created: [],
            updated: allRecords.map(drizzleToCamelRecord),
            deleted: [],
        }
    }

    const [changed, deleted] = await Promise.all([
        db
            .select()
            .from(table)
            .where(
                and(eq(table.userId, userId), gt(table.lastModified, lastPulledAt), eq(table.isDeleted, false))
            ),
        db
            .select({ id: table.id })
            .from(table)
            .where(and(eq(table.userId, userId), gt(table.lastModified, lastPulledAt), eq(table.isDeleted, true))),
    ])

    return {
        created: [],
        updated: changed.map(drizzleToCamelRecord),
        deleted: deleted.map((r) => r.id),
    }
}

syncRoutes.get('/pull', requireAuth, async (c) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    const lastPulledAtParam = c.req.query('last_pulled_at')
    const lastPulledAt =
        lastPulledAtParam && Number(lastPulledAtParam) > 0 ? new Date(Number(lastPulledAtParam)) : null

    const tableNames = Object.keys(SYNC_TABLES) as SyncTableName[]
    const results = await Promise.all(tableNames.map((name) => pullTable(SYNC_TABLES[name], user.id, lastPulledAt)))

    const changes: Record<string, { created: unknown[]; updated: unknown[]; deleted: string[] }> = {}
    tableNames.forEach((name, i) => {
        changes[name] = results[i]
    })

    return c.json({
        changes,
        timestamp: Date.now(),
    })
})

const pushBodySchema = z.object({
    changes: z.record(
        z.object({
            created: z.array(z.record(z.unknown())).optional().default([]),
            updated: z.array(z.record(z.unknown())).optional().default([]),
            deleted: z.array(z.string()).optional().default([]),
        })
    ),
    lastPulledAt: z.number().nullable(),
})

syncRoutes.post('/push', requireAuth, async (c) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    const rawBody = await c.req.json()
    const parseResult = pushBodySchema.safeParse(rawBody)
    if (!parseResult.success) {
        return c.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, 400)
    }
    const { changes, lastPulledAt } = parseResult.data
    const lastPulledAtDate = lastPulledAt ? new Date(lastPulledAt) : null
    const now = new Date()

    try {
        await db.transaction(async (tx) => {
            for (const [tableName, tableChanges] of Object.entries(changes)) {
                const table = SYNC_TABLES[tableName as SyncTableName]
                if (!table) continue

                if (tableChanges.created?.length) {
                    for (const record of tableChanges.created) {
                        const sanitized = sanitizeRecord(record, tableName as SyncTableName)
                        const mapped = snakeToDrizzleRecord(sanitized)
                        delete mapped.id
                        const values = {
                            id: record.id as string,
                            ...mapped,
                            userId: user.id,
                            serverCreatedAt: now,
                            lastModified: now,
                            isDeleted: false,
                        }
                        await tx
                            .insert(table)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .values(values as any)
                            .onConflictDoUpdate({
                                target: table.id,
                                set: {
                                    ...mapped,
                                    userId: user.id,
                                    lastModified: now,
                                    isDeleted: false,
                                } as Record<string, unknown>,
                            })
                    }
                }

                if (tableChanges.updated?.length) {
                    for (const record of tableChanges.updated) {
                        const sanitized = sanitizeRecord(record, tableName as SyncTableName)
                        const mapped = snakeToDrizzleRecord(sanitized)
                        const id = record.id as string
                        delete mapped.id

                        if (lastPulledAtDate) {
                            const [existing] = await tx
                                .select({ lastModified: table.lastModified })
                                .from(table)
                                .where(and(eq(table.id, id), eq(table.userId, user.id)))

                            if (existing && existing.lastModified > lastPulledAtDate) {
                                throw new Error(`Conflict on ${tableName} record ${id}`)
                            }
                        }

                        const values = {
                            id,
                            ...mapped,
                            userId: user.id,
                            serverCreatedAt: now,
                            lastModified: now,
                            isDeleted: false,
                        }
                        await tx
                            .insert(table)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .values(values as any)
                            .onConflictDoUpdate({
                                target: table.id,
                                set: {
                                    ...mapped,
                                    lastModified: now,
                                } as Record<string, unknown>,
                            })
                    }
                }

                if (tableChanges.deleted?.length) {
                    for (const id of tableChanges.deleted) {
                        await tx
                            .update(table)
                            .set({
                                isDeleted: true,
                                lastModified: now,
                            } as Record<string, unknown>)
                            .where(and(eq(table.id, id), eq(table.userId, user.id)))
                    }
                }
            }
        })

        return c.json({ ok: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Push failed'
        if (message.startsWith('Conflict')) {
            return c.json({ error: message }, 409)
        }
        throw error
    }
})

export { syncRoutes }
