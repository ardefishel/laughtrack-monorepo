import { createMiddleware } from 'hono/factory'
import { auth } from '../auth'
import type { User, Session } from '../auth'

type AuthEnv = {
  Variables: {
    user: User | null
    session: Session | null
  }
}

const ADMIN_ROLE = 'admin'

const hasRole = (user: User | null, targetRole: string) => {
  if (!user) return false
  const roleValue = (user as User & { role?: string | string[] }).role
  if (!roleValue) return false
  if (Array.isArray(roleValue)) {
    return roleValue.includes(targetRole)
  }

  return roleValue
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)
    .includes(targetRole)
}

async function loadSession(headers: Headers) {
  const sessionResult = await auth.api.getSession({ headers })
  if (!sessionResult) return null
  return {
    user: sessionResult.user as User,
    session: sessionResult.session as Session,
  }
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const result = await loadSession(c.req.raw.headers)

    if (result) {
      c.set('user', result.user)
      c.set('session', result.session)
    } else {
      c.set('user', null)
      c.set('session', null)
    }
  } catch {
    c.set('user', null)
    c.set('session', null)
  }

  await next()
  return
})

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const result = await loadSession(c.req.raw.headers)

    if (!result) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', result.user)
    c.set('session', result.session)
    await next()
    return
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})

export const requireAdmin = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const result = await loadSession(c.req.raw.headers)

    if (!result) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (!hasRole(result.user, ADMIN_ROLE)) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    c.set('user', result.user)
    c.set('session', result.session)
    await next()
    return
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})
