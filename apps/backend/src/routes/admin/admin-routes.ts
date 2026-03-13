import { and, count, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../db'
import { bits, notes, premises, setlists, users } from '../../db/schema'
import { errorResponse, paginatedResponse, successResponse } from '../../lib/response'
import { requireAdmin } from '../../middlewares/auth'

const webRoutes = new Hono()

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    userId: z.string().optional(),
})

const updateUserSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    role: z.enum(['user', 'admin']).optional(),
    banned: z.boolean().optional(),
    banReason: z.string().max(1000).nullable().optional(),
})

function parsePagination(query: Record<string, string>) {
    const result = paginationSchema.safeParse(query)
    if (!result.success) return null
    const { page, limit, userId } = result.data
    return { page, limit, offset: (page - 1) * limit, userId }
}

webRoutes.get('/stats', requireAdmin, async (c) => {
    const [userCount] = await db.select({ count: count() }).from(users)
    const [noteCount] = await db.select({ count: count() }).from(notes).where(eq(notes.isDeleted, false))
    const [bitCount] = await db.select({ count: count() }).from(bits).where(eq(bits.isDeleted, false))
    const [premiseCount] = await db.select({ count: count() }).from(premises).where(eq(premises.isDeleted, false))
    const [setlistCount] = await db.select({ count: count() }).from(setlists).where(eq(setlists.isDeleted, false))

    return c.json(
        successResponse({
            users: userCount.count,
            notes: noteCount.count,
            bits: bitCount.count,
            premises: premiseCount.count,
            setlists: setlistCount.count
        })
    )
})

webRoutes.get('/users', requireAdmin, async (c) => {
    const params = parsePagination(c.req.query())
    if (!params) return c.json(errorResponse('Invalid pagination parameters'), 400)
    const { page, limit, offset } = params

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

    if (!user) return c.json(errorResponse('User not found'), 404)

    const [noteCount] = await db
        .select({ count: count() })
        .from(notes)
        .where(and(eq(notes.userId, userId), eq(notes.isDeleted, false)))
    const [bitCount] = await db
        .select({ count: count() })
        .from(bits)
        .where(and(eq(bits.userId, userId), eq(bits.isDeleted, false)))
    const [premiseCount] = await db
        .select({ count: count() })
        .from(premises)
        .where(and(eq(premises.userId, userId), eq(premises.isDeleted, false)))
    const [setlistCount] = await db
        .select({ count: count() })
        .from(setlists)
        .where(and(eq(setlists.userId, userId), eq(setlists.isDeleted, false)))

    return c.json(
        successResponse({
            ...user,
            notesCount: noteCount.count,
            bitsCount: bitCount.count,
            premisesCount: premiseCount.count,
            setlistsCount: setlistCount.count
        })
    )
})

webRoutes.put('/users/:id', requireAdmin, async (c) => {
    const userId = c.req.param('id')
    const rawBody = await c.req.json()
    const parseResult = updateUserSchema.safeParse(rawBody)
    if (!parseResult.success) {
        return c.json(errorResponse('Invalid request body', 400, parseResult.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
        }))), 400)
    }
    const body = parseResult.data

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId))
    if (!existing) return c.json(errorResponse('User not found'), 404)

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) updates.email = body.email
    if (body.role !== undefined) updates.role = body.role
    if (body.banned !== undefined) updates.banned = body.banned
    if (body.banReason !== undefined) updates.banReason = body.banReason

    await db.update(users).set(updates).where(eq(users.id, userId))

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

webRoutes.get('/notes', requireAdmin, async (c) => {
    const params = parsePagination(c.req.query())
    if (!params) return c.json(errorResponse('Invalid pagination parameters'), 400)
    const { page, limit, offset, userId } = params

    const conditions = [eq(notes.isDeleted, false)]
    if (userId) conditions.push(eq(notes.userId, userId))
    const where = and(...conditions)

    const [totalResult] = await db.select({ count: count() }).from(notes).where(where)

    const rows = await db
        .select({
            id: notes.id,
            content: notes.content,
            userId: notes.userId,
            userName: users.name,
            userEmail: users.email,
            createdAt: notes.createdAt,
            updatedAt: notes.updatedAt
        })
        .from(notes)
        .leftJoin(users, eq(notes.userId, users.id))
        .where(where)
        .limit(limit)
        .offset(offset)

    const mapped = rows.map((r) => ({
        ...r,
        content: r.content ? r.content.slice(0, 200) : null
    }))

    return c.json(paginatedResponse(mapped, { page, limit, total: totalResult.count }))
})

webRoutes.get('/bits', requireAdmin, async (c) => {
    const params = parsePagination(c.req.query())
    if (!params) return c.json(errorResponse('Invalid pagination parameters'), 400)
    const { page, limit, offset, userId } = params

    const conditions = [eq(bits.isDeleted, false)]
    if (userId) conditions.push(eq(bits.userId, userId))
    const where = and(...conditions)

    const [totalResult] = await db.select({ count: count() }).from(bits).where(where)

    const rows = await db
        .select({
            id: bits.id,
            content: bits.content,
            status: bits.status,
            tagsJson: bits.tagsJson,
            premiseId: bits.premiseId,
            userId: bits.userId,
            userName: users.name,
            userEmail: users.email,
            createdAt: bits.createdAt,
            updatedAt: bits.updatedAt
        })
        .from(bits)
        .leftJoin(users, eq(bits.userId, users.id))
        .where(where)
        .limit(limit)
        .offset(offset)

    const mapped = rows.map((r) => ({
        ...r,
        content: r.content ? r.content.slice(0, 200) : null
    }))

    return c.json(paginatedResponse(mapped, { page, limit, total: totalResult.count }))
})

webRoutes.get('/premises', requireAdmin, async (c) => {
    const params = parsePagination(c.req.query())
    if (!params) return c.json(errorResponse('Invalid pagination parameters'), 400)
    const { page, limit, offset, userId } = params

    const conditions = [eq(premises.isDeleted, false)]
    if (userId) conditions.push(eq(premises.userId, userId))
    const where = and(...conditions)

    const [totalResult] = await db.select({ count: count() }).from(premises).where(where)

    const rows = await db
        .select({
            id: premises.id,
            content: premises.content,
            status: premises.status,
            attitude: premises.attitude,
            tagsJson: premises.tagsJson,
            userId: premises.userId,
            userName: users.name,
            userEmail: users.email,
            createdAt: premises.createdAt,
            updatedAt: premises.updatedAt
        })
        .from(premises)
        .leftJoin(users, eq(premises.userId, users.id))
        .where(where)
        .limit(limit)
        .offset(offset)

    const mapped = rows.map((r) => ({
        ...r,
        content: r.content ? r.content.slice(0, 200) : null
    }))

    return c.json(paginatedResponse(mapped, { page, limit, total: totalResult.count }))
})

webRoutes.get('/setlists', requireAdmin, async (c) => {
    const params = parsePagination(c.req.query())
    if (!params) return c.json(errorResponse('Invalid pagination parameters'), 400)
    const { page, limit, offset, userId } = params

    const conditions = [eq(setlists.isDeleted, false)]
    if (userId) conditions.push(eq(setlists.userId, userId))
    const where = and(...conditions)

    const [totalResult] = await db.select({ count: count() }).from(setlists).where(where)

    const rows = await db
        .select({
            id: setlists.id,
            description: setlists.description,
            tagsJson: setlists.tagsJson,
            userId: setlists.userId,
            userName: users.name,
            userEmail: users.email,
            createdAt: setlists.createdAt,
            updatedAt: setlists.updatedAt
        })
        .from(setlists)
        .leftJoin(users, eq(setlists.userId, users.id))
        .where(where)
        .limit(limit)
        .offset(offset)

    const mapped = rows.map((r) => ({
        ...r,
        description: r.description ? r.description.slice(0, 200) : null
    }))

    return c.json(paginatedResponse(mapped, { page, limit, total: totalResult.count }))
})

export { webRoutes }
