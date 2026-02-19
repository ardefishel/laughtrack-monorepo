import { and, count, eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../../db'
import { audioRecordings, jokes, jokeSetItems, jokeSets, tags, users } from '../../db/schema'
import { errorResponse, paginatedResponse, successResponse } from '../../lib/response'
import { requireAdmin, requireAuth } from '../../middlewares/auth'

const webRoutes = new Hono()

// GET /stats — dashboard summary (any authenticated user)
webRoutes.get('/stats', requireAuth, async (c) => {
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

// GET /users — list all users (admin only)
webRoutes.get('/users', requireAdmin, async (c) => {
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
            role: users.role,
            banned: users.banned,
            emailVerified: users.emailVerified,
            createdAt: users.createdAt
        })
        .from(users)
        .limit(limit)
        .offset(offset)

    return c.json(paginatedResponse(rows, { page, limit, total: totalResult.count }))
})

// GET /users/:id — user detail with content counts (admin only)
webRoutes.get('/users/:id', requireAdmin, async (c) => {
    const userId = c.req.param('id')

    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            image: users.image,
            role: users.role,
            banned: users.banned,
            banReason: users.banReason,
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

// PUT /users/:id — update user details (admin only)
webRoutes.put('/users/:id', requireAdmin, async (c) => {
    const userId = c.req.param('id')
    const body = await c.req.json<{
        name?: string
        email?: string
        role?: string
        banned?: boolean
        banReason?: string | null
    }>()

    // Validate role if provided
    const validRoles = ['user', 'admin']
    if (body.role !== undefined && !validRoles.includes(body.role)) {
        return c.json(errorResponse('Invalid role. Must be one of: user, admin', 400), 400)
    }

    // Check user exists
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId))
    if (!existing) return c.json(errorResponse('User not found', 404), 404)

    // Build update object with only provided fields
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) updates.email = body.email
    if (body.role !== undefined) updates.role = body.role
    if (body.banned !== undefined) updates.banned = body.banned
    if (body.banReason !== undefined) updates.banReason = body.banReason

    await db.update(users).set(updates).where(eq(users.id, userId))

    // Return the updated user
    const [updated] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            image: users.image,
            role: users.role,
            banned: users.banned,
            banReason: users.banReason,
            emailVerified: users.emailVerified,
            createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.id, userId))

    return c.json(successResponse(updated))
})

// GET /jokes — list all jokes (any authenticated user)
webRoutes.get('/jokes', requireAuth, async (c) => {
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
            contentHtml: jokes.contentHtml,
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
        contentText: r.contentText ? r.contentText.slice(0, 100) : null,
        contentHtml: r.contentHtml ? r.contentHtml.slice(0, 500) : null
    }))

    return c.json(paginatedResponse(mapped, { page, limit, total: totalResult.count }))
})

// GET /jokes/:id — single joke detail (any authenticated user)
webRoutes.get('/jokes/:id', requireAuth, async (c) => {
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

// GET /sets — list all joke sets (any authenticated user)
webRoutes.get('/sets', requireAuth, async (c) => {
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

// GET /sets/:id — single set detail with items (any authenticated user)
webRoutes.get('/sets/:id', requireAuth, async (c) => {
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

    const itemRows = await db
        .select({
            id: jokeSetItems.id,
            itemType: jokeSetItems.itemType,
            jokeId: jokeSetItems.jokeId,
            content: jokeSetItems.content,
            position: jokeSetItems.position,
            jokeTitle: jokes.contentText,
        })
        .from(jokeSetItems)
        .leftJoin(jokes, eq(jokeSetItems.jokeId, jokes.id))
        .where(and(eq(jokeSetItems.setId, setId), eq(jokeSetItems.isDeleted, false)))

    const items = itemRows.map((item) => ({
        ...item,
        jokeTitle: item.jokeTitle ? item.jokeTitle.slice(0, 100) : null,
    }))

    return c.json(successResponse({ ...row, items }))
})

export { webRoutes }
