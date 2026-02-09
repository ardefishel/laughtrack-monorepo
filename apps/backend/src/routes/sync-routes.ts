import { Hono } from 'hono'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '../db'
import { jokes, jokeSets, jokeSetItems } from '../db/schema'
import { requireAuth } from '../middlewares/auth'

const syncRoutes = new Hono()

const SYNC_TABLES = {
  jokes,
  joke_sets: jokeSets,
  joke_set_items: jokeSetItems,
} as const

type SyncTableName = keyof typeof SYNC_TABLES

const CAMEL_TO_SNAKE: Record<string, string> = {
  contentHtml: 'content_html',
  contentText: 'content_text',
  draftUpdatedAt: 'draft_updated_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  setId: 'set_id',
  itemType: 'item_type',
  jokeId: 'joke_id',
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

type SyncTable = typeof jokes | typeof jokeSets | typeof jokeSetItems

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

interface SyncChanges {
  [tableName: string]: {
    created?: Record<string, unknown>[]
    updated?: Record<string, unknown>[]
    deleted?: string[]
  }
}

interface PushBody {
  changes: SyncChanges
  lastPulledAt: number
}

syncRoutes.post('/push', requireAuth, async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json<PushBody>()
  const { changes, lastPulledAt } = body
  const lastPulledAtDate = lastPulledAt ? new Date(lastPulledAt) : null
  const now = new Date()

  try {
    await db.transaction(async (tx) => {
      for (const [tableName, tableChanges] of Object.entries(changes)) {
        const table = SYNC_TABLES[tableName as SyncTableName]
        if (!table) continue

        if (tableChanges.created?.length) {
          for (const record of tableChanges.created) {
            const mapped = snakeToDrizzleRecord(record)
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
            const mapped = snakeToDrizzleRecord(record)
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

            await tx
              .update(table)
              .set({
                ...mapped,
                lastModified: now,
              } as Record<string, unknown>)
              .where(and(eq(table.id, id), eq(table.userId, user.id)))
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
