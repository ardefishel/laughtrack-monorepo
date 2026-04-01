import { Hono } from 'hono'
import type { Context } from 'hono'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '../auth'
import { db } from '../db'
import { accounts, users } from '../db/schema'
import { authLogger, defaultLogger } from '../lib/logger'
import { authMiddleware } from '../middlewares/auth'
import { errorResponse } from '../lib/response'
import {
  consumeVerificationResendThrottle,
  normalizeEmail,
  verificationResendSuccessResponse,
} from '../lib/email/resend-verification'

authLogger.info({ module: 'routes/auth-routes' }, 'Starting auth routes module initialization')

const authRoutes = new Hono()
const resendVerificationBodySchema = z.object({
  email: z.string().email(),
})

function redactEmail(email: string) {
  const [localPart, domain = ''] = email.split('@')
  if (!localPart) return '[REDACTED]'
  const visibleLocalPart = localPart.length <= 2 ? `${localPart[0]}*` : `${localPart.slice(0, 2)}***`
  return `${visibleLocalPart}@${domain}`
}

function getRequestPath(url: string) {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

function getAuthRequestDiagnostics(c: Context) {
  return {
    method: c.req.method,
    path: getRequestPath(c.req.url),
    requestId: c.req.header('x-request-id') ?? null,
    hasAuthorizationHeader: Boolean(c.req.header('authorization')),
    hasCookieHeader: Boolean(c.req.header('cookie')),
    contentType: c.req.header('content-type') ?? null,
    origin: c.req.header('origin') ?? null,
    userAgent: c.req.header('user-agent') ?? null,
  }
}

authLogger.info({ module: 'routes/auth-routes' }, 'Auth routes module initialized; registering endpoints')

authRoutes.get('/session', authMiddleware, async (c) => {
  authLogger.info(getAuthRequestDiagnostics(c), 'Handling auth session request')
  const user = c.get('user')
  const session = c.get('session')

  if (!user || !session) {
    authLogger.warn(getAuthRequestDiagnostics(c), 'Auth session request is unauthenticated')
    return c.json({ error: 'Not authenticated' }, 401)
  }

  authLogger.info({
    ...getAuthRequestDiagnostics(c),
    userId: user.id,
    sessionId: session.id,
  }, 'Auth session request succeeded')
  return c.json({ user, session })
})

authRoutes.get('/verify', authMiddleware, async (c) => {
  authLogger.info(getAuthRequestDiagnostics(c), 'Handling auth verify request')
  const user = c.get('user')
  if (!user) {
    authLogger.warn(getAuthRequestDiagnostics(c), 'Auth verify request is unauthenticated')
    return c.json({ valid: false }, 401)
  }

  authLogger.info({
    ...getAuthRequestDiagnostics(c),
    userId: user.id,
    emailVerified: user.emailVerified,
  }, 'Auth verify request succeeded')
  return c.json({ valid: true, user })
})

authRoutes.post('/verification/resend', async (c) => {
  authLogger.info(getAuthRequestDiagnostics(c), 'Handling verification resend request')

  authLogger.info(getAuthRequestDiagnostics(c), 'Parsing verification resend request body')
  const body = resendVerificationBodySchema.safeParse(await c.req.json().catch(() => null))

  if (!body.success) {
    authLogger.warn({
      ...getAuthRequestDiagnostics(c),
      issueCount: body.error.issues.length,
    }, 'Verification resend request body validation failed')
    return c.json(errorResponse('Invalid request body'), 400)
  }

  const email = normalizeEmail(body.data.email)
  authLogger.info({
    ...getAuthRequestDiagnostics(c),
    email: redactEmail(email),
  }, 'Verification resend request body parsed successfully')

  authLogger.info({
    ...getAuthRequestDiagnostics(c),
    email: redactEmail(email),
  }, 'Checking verification resend throttle')
  const throttle = consumeVerificationResendThrottle(email)

  if (!throttle.allowed) {
    authLogger.warn({
      ...getAuthRequestDiagnostics(c),
      email: redactEmail(email),
      retryAfterSeconds: throttle.retryAfterSeconds,
    }, 'Verification resend request throttled')
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

  authLogger.info({
    ...getAuthRequestDiagnostics(c),
    email: redactEmail(email),
  }, 'Looking up user for verification resend')
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      id: true,
      emailVerified: true,
    },
  })

  authLogger.info({
    ...getAuthRequestDiagnostics(c),
    email: redactEmail(email),
    userFound: Boolean(user),
    emailVerified: user?.emailVerified ?? null,
  }, 'Completed user lookup for verification resend')

  if (user && !user.emailVerified) {
    authLogger.info({
      ...getAuthRequestDiagnostics(c),
      userId: user.id,
      email: redactEmail(email),
    }, 'Loading account providers for verification resend')
    const userAccounts = await db
      .select({ providerId: accounts.providerId })
      .from(accounts)
      .where(eq(accounts.userId, user.id))

    authLogger.info({
      ...getAuthRequestDiagnostics(c),
      userId: user.id,
      email: redactEmail(email),
      providerIds: userAccounts.map((account) => account.providerId),
    }, 'Loaded account providers for verification resend')

    if (userAccounts.some((account) => account.providerId === 'credential')) {
      authLogger.info({
        ...getAuthRequestDiagnostics(c),
        userId: user.id,
        email: redactEmail(email),
      }, 'Triggering better-auth verification resend')
      void auth.api
        .sendVerificationEmail({
          body: { email },
        })
        .then(() => {
          authLogger.info({
            ...getAuthRequestDiagnostics(c),
            userId: user.id,
            email: redactEmail(email),
          }, 'better-auth verification resend completed')
        })
        .catch((error) => {
          authLogger.error({
            ...getAuthRequestDiagnostics(c),
            userId: user.id,
            email: redactEmail(email),
            errorName: error instanceof Error ? error.name : 'UnknownError',
            errorMessage: error instanceof Error ? error.message : String(error),
          }, 'better-auth verification resend failed')
          defaultLogger.error({
            email: redactEmail(email),
            errorName: error instanceof Error ? error.name : 'UnknownError',
          }, 'Failed to trigger verification resend')
        })
    } else {
      authLogger.info({
        ...getAuthRequestDiagnostics(c),
        userId: user.id,
        email: redactEmail(email),
      }, 'Skipping verification resend because user has no credential provider')
    }
  } else if (user?.emailVerified) {
    authLogger.info({
      ...getAuthRequestDiagnostics(c),
      userId: user.id,
      email: redactEmail(email),
    }, 'Skipping verification resend because email is already verified')
  } else {
    authLogger.info({
      ...getAuthRequestDiagnostics(c),
      email: redactEmail(email),
    }, 'Skipping verification resend because no matching user was found')
  }

  authLogger.info({
    ...getAuthRequestDiagnostics(c),
    email: redactEmail(email),
  }, 'Returning verification resend success response')
  return c.json(verificationResendSuccessResponse())
})

// Mount better-auth handler for all auth actions
authRoutes.all('/*', async (c) => {
  authLogger.info(getAuthRequestDiagnostics(c), 'Forwarding request to better-auth catch-all handler')

  try {
    const response = await auth.handler(c.req.raw)
    authLogger.info({
      ...getAuthRequestDiagnostics(c),
      status: response.status,
    }, 'better-auth catch-all handler completed')
    return response
  } catch (error) {
    authLogger.error({
      ...getAuthRequestDiagnostics(c),
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    }, 'better-auth catch-all handler threw an error')
    throw error
  }
})

authLogger.info({ module: 'routes/auth-routes' }, 'Auth routes registration completed')

export { authRoutes }
