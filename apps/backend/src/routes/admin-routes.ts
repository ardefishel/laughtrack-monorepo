import { Hono } from 'hono'
import { eq, and, count, inArray } from 'drizzle-orm'
import { db } from '../db'
import { users, jokes, jokeSets, jokeSetItems, audioRecordings, tags } from '../db/schema'
import { successResponse, paginatedResponse, errorResponse } from '../lib/response'
import { requireAdmin } from '../middlewares/auth'

const adminRoutes = new Hono()

adminRoutes.use('*', requireAdmin)

// GET /stats — dashboard summary
adminRoutes.get('/stats', async (c) => {
  const [userCount] = await db.select({ count: count() }).from(users)
  const [jokeCount] = await db.select({ count: count() }).from(jokes).where(eq(jokes.isDeleted, false))
  const [setCount] = await db.select({ count: count() }).from(jokeSets).where(eq(jokeSets.isDeleted, false))
  const [audioCount] = await db
    .select({ count: count() })
    .from(audioRecordings)
    .where(eq(audioRecordings.isDeleted, false))
  const [tagCount] = await db.select({ count: count() }).from(tags).where(eq(tags.isDeleted, false))

  return c.json(
    successResponse({
      users: userCount.count,
      jokes: jokeCount.count,
      sets: setCount.count,
      audioRecordings: audioCount.count,
      tags: tagCount.count
    })
  )
})

// GET /users — list all users
adminRoutes.get('/users', async (c) => {
  const page = Number(c.req.query('page') || '1')
  const limit = Number(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const [totalResult] = await db.select({ count: count() }).from(users)

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt
    })
    .from(users)
    .limit(limit)
    .offset(offset)

  return c.json(paginatedResponse(rows, { page, limit, total: totalResult.count }))
})

// GET /users/:id — user detail with content counts
adminRoutes.get('/users/:id', async (c) => {
  const userId = c.req.param('id')

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, userId))

  if (!user) return c.json(errorResponse('User not found', 404), 404)

  const [jokeCount] = await db
    .select({ count: count() })
    .from(jokes)
    .where(and(eq(jokes.userId, userId), eq(jokes.isDeleted, false)))
  const [setCount] = await db
    .select({ count: count() })
    .from(jokeSets)
    .where(and(eq(jokeSets.userId, userId), eq(jokeSets.isDeleted, false)))
  const [audioCount] = await db
    .select({ count: count() })
    .from(audioRecordings)
    .where(and(eq(audioRecordings.userId, userId), eq(audioRecordings.isDeleted, false)))
  const [tagCount] = await db
    .select({ count: count() })
    .from(tags)
    .where(and(eq(tags.userId, userId), eq(tags.isDeleted, false)))

  return c.json(
    successResponse({
      ...user,
      jokesCount: jokeCount.count,
      setsCount: setCount.count,
      audioRecordingsCount: audioCount.count,
      tagsCount: tagCount.count
    })
  )
})

// GET /jokes — list all jokes
adminRoutes.get('/jokes', async (c) => {
  const page = Number(c.req.query('page') || '1')
  const limit = Number(c.req.query('limit') || '20')
  const userId = c.req.query('userId')
  const offset = (page - 1) * limit

  const conditions = [eq(jokes.isDeleted, false)]
  if (userId) conditions.push(eq(jokes.userId, userId))
  const where = and(...conditions)

  const [totalResult] = await db.select({ count: count() }).from(jokes).where(where)

  const rows = await db
    .select({
      id: jokes.id,
      contentText: jokes.contentText,
      status: jokes.status,
      userId: jokes.userId,
      userName: users.name,
      userEmail: users.email,
      createdAt: jokes.createdAt,
      updatedAt: jokes.updatedAt
    })
    .from(jokes)
    .leftJoin(users, eq(jokes.userId, users.id))
    .where(where)
    .limit(limit)
    .offset(offset)

  const mapped = rows.map((r) => ({
    ...r,
    contentText: r.contentText ? r.contentText.slice(0, 100) : null
  }))

  return c.json(paginatedResponse(mapped, { page, limit, total: totalResult.count }))
})

// GET /jokes/:id — single joke detail
adminRoutes.get('/jokes/:id', async (c) => {
  const jokeId = c.req.param('id')

  const [row] = await db
    .select({
      id: jokes.id,
      contentHtml: jokes.contentHtml,
      contentText: jokes.contentText,
      status: jokes.status,
      tags: jokes.tags,
      userId: jokes.userId,
      userName: users.name,
      userEmail: users.email,
      createdAt: jokes.createdAt,
      updatedAt: jokes.updatedAt,
      draftUpdatedAt: jokes.draftUpdatedAt
    })
    .from(jokes)
    .leftJoin(users, eq(jokes.userId, users.id))
    .where(and(eq(jokes.id, jokeId), eq(jokes.isDeleted, false)))

  if (!row) return c.json(errorResponse('Joke not found', 404), 404)

  return c.json(successResponse(row))
})

// GET /sets — list all joke sets
adminRoutes.get('/sets', async (c) => {
  const page = Number(c.req.query('page') || '1')
  const limit = Number(c.req.query('limit') || '20')
  const userId = c.req.query('userId')
  const offset = (page - 1) * limit

  const conditions = [eq(jokeSets.isDeleted, false)]
  if (userId) conditions.push(eq(jokeSets.userId, userId))
  const where = and(...conditions)

  const [totalResult] = await db.select({ count: count() }).from(jokeSets).where(where)

  const rows = await db
    .select({
      id: jokeSets.id,
      title: jokeSets.title,
      description: jokeSets.description,
      duration: jokeSets.duration,
      place: jokeSets.place,
      status: jokeSets.status,
      userId: jokeSets.userId,
      userName: users.name,
      userEmail: users.email,
      createdAt: jokeSets.createdAt,
      updatedAt: jokeSets.updatedAt
    })
    .from(jokeSets)
    .leftJoin(users, eq(jokeSets.userId, users.id))
    .where(where)
    .limit(limit)
    .offset(offset)

  const setIds = rows.map((r) => r.id)
  let itemCounts: Record<string, number> = {}
  if (setIds.length > 0) {
    const counts = await db
      .select({ setId: jokeSetItems.setId, count: count() })
      .from(jokeSetItems)
      .where(and(eq(jokeSetItems.isDeleted, false), inArray(jokeSetItems.setId, setIds)))
      .groupBy(jokeSetItems.setId)
    itemCounts = Object.fromEntries(counts.map((r) => [r.setId, r.count]))
  }

  const mapped = rows.map((r) => ({
    ...r,
    itemCount: itemCounts[r.id] ?? 0
  }))

  return c.json(paginatedResponse(mapped, { page, limit, total: totalResult.count }))
})

// GET /sets/:id — single set detail with items
adminRoutes.get('/sets/:id', async (c) => {
  const setId = c.req.param('id')

  const [row] = await db
    .select({
      id: jokeSets.id,
      title: jokeSets.title,
      description: jokeSets.description,
      duration: jokeSets.duration,
      place: jokeSets.place,
      status: jokeSets.status,
      userId: jokeSets.userId,
      userName: users.name,
      userEmail: users.email,
      createdAt: jokeSets.createdAt,
      updatedAt: jokeSets.updatedAt
    })
    .from(jokeSets)
    .leftJoin(users, eq(jokeSets.userId, users.id))
    .where(and(eq(jokeSets.id, setId), eq(jokeSets.isDeleted, false)))

  if (!row) return c.json(errorResponse('Set not found', 404), 404)

  const items = await db
    .select()
    .from(jokeSetItems)
    .where(and(eq(jokeSetItems.setId, setId), eq(jokeSetItems.isDeleted, false)))

  return c.json(successResponse({ ...row, items }))
})

export { adminRoutes }
