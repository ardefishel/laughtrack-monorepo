import { Hono } from 'hono'
import { auth } from '../auth'
import { authMiddleware } from '../middlewares/auth'

const authRoutes = new Hono()

authRoutes.get('/session', authMiddleware, async (c) => {
  const user = c.get('user')
  const session = c.get('session')

  if (!user || !session) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  return c.json({ user, session })
})

authRoutes.get('/verify', authMiddleware, async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ valid: false }, 401)
  }
  return c.json({ valid: true, user })
})

// Mount better-auth handler for all auth actions
authRoutes.all('/*', async (c) => {
  return auth.handler(c.req.raw)
})

export { authRoutes }
