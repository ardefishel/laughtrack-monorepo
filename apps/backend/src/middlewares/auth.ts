import { createMiddleware } from 'hono/factory'
import { auth } from '../auth'
import type { User, Session } from '../auth'

type AuthEnv = {
  Variables: {
    user: User | null
    session: Session | null
  }
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const sessionResult = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (sessionResult) {
      c.set('user', sessionResult.user as User)
      c.set('session', sessionResult.session as Session)
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
    const sessionResult = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!sessionResult) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', sessionResult.user as User)
    c.set('session', sessionResult.session as Session)
    await next()
    return
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})
