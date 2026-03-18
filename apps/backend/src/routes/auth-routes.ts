import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '../auth'
import { db } from '../db'
import { accounts, users } from '../db/schema'
import { defaultLogger } from '@laughtrack/logger/node'
import { authMiddleware } from '../middlewares/auth'
import { errorResponse } from '../lib/response'
import {
  consumeVerificationResendThrottle,
  normalizeEmail,
  verificationResendSuccessResponse,
} from '../lib/email/resend-verification'

const authRoutes = new Hono()
const resendVerificationBodySchema = z.object({
  email: z.string().email(),
})

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

authRoutes.post('/verification/resend', async (c) => {
  const body = resendVerificationBodySchema.safeParse(await c.req.json().catch(() => null))

  if (!body.success) {
    return c.json(errorResponse('Invalid request body'), 400)
  }

  const email = normalizeEmail(body.data.email)
  const throttle = consumeVerificationResendThrottle(email)

  if (!throttle.allowed) {
    return c.json(
      errorResponse(
        'Too many verification email requests. Please wait before trying again.',
        undefined,
        'verification_resend_throttled',
      ),
      429,
      {
        'Retry-After': String(throttle.retryAfterSeconds),
      },
    )
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      id: true,
      emailVerified: true,
    },
  })

  if (user && !user.emailVerified) {
    const userAccounts = await db
      .select({ providerId: accounts.providerId })
      .from(accounts)
      .where(eq(accounts.userId, user.id))

    if (userAccounts.some((account) => account.providerId === 'credential')) {
      void auth.api
        .sendVerificationEmail({
          body: { email },
        })
        .catch((error) => {
          defaultLogger.error('Failed to trigger verification resend', {
            email,
            errorName: error instanceof Error ? error.name : 'UnknownError',
          })
        })
    }
  }

  return c.json(verificationResendSuccessResponse())
})

// Mount better-auth handler for all auth actions
authRoutes.all('/*', async (c) => {
  return auth.handler(c.req.raw)
})

export { authRoutes }
