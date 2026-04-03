import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { auth } from '../auth/index'
import type { User, Session } from '../auth/index'
import { db } from '../db/index'
import { accounts } from '../db/schema'
import { authLogger } from '../lib/logger'
import { errorResponse } from '../lib/response'
import { EMAIL_NOT_VERIFIED_CODE, requiresVerifiedEmail } from './auth-helpers'

type AuthEnv = {
  Variables: {
    user: User | null
    session: Session | null
  }
}

const ADMIN_ROLE = 'admin'

function getHeaderDiagnostics(headers: Headers) {
  return {
    hasAuthorizationHeader: Boolean(headers.get('authorization')),
    hasCookieHeader: Boolean(headers.get('cookie')),
    origin: headers.get('origin') ?? null,
    userAgent: headers.get('user-agent') ?? null,
  }
}

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
  authLogger.info({
    middleware: 'loadSession',
    ...getHeaderDiagnostics(headers),
  }, 'Starting auth session lookup')

  const sessionResult = await auth.api.getSession({ headers })
  if (!sessionResult) {
    authLogger.info({ middleware: 'loadSession' }, 'No auth session returned from better-auth')
    return null
  }

  authLogger.info({
    middleware: 'loadSession',
    userId: sessionResult.user.id,
    sessionId: sessionResult.session.id,
    emailVerified: sessionResult.user.emailVerified,
  }, 'Received auth session from better-auth')

  authLogger.info({
    middleware: 'loadSession',
    userId: sessionResult.user.id,
  }, 'Loading provider IDs for authenticated user')
  const providerIds = await db
    .select({ providerId: accounts.providerId })
    .from(accounts)
    .where(eq(accounts.userId, sessionResult.user.id))

  authLogger.info({
    middleware: 'loadSession',
    userId: sessionResult.user.id,
    providerIds: providerIds.map((account) => account.providerId),
  }, 'Loaded provider IDs for authenticated user')

  return {
    user: sessionResult.user as User,
    session: sessionResult.session as Session,
    providerIds: providerIds.map((account) => account.providerId),
  }
}

function emailNotVerifiedResponse() {
  return errorResponse('Email not verified', undefined, EMAIL_NOT_VERIFIED_CODE)
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    authLogger.info({
      middleware: 'authMiddleware',
      method: c.req.method,
      path: c.req.path,
    }, 'Entering auth middleware')

    const result = await loadSession(c.req.raw.headers)

    if (result) {
      c.set('user', result.user)
      c.set('session', result.session)
      authLogger.info({
        middleware: 'authMiddleware',
        method: c.req.method,
        path: c.req.path,
        userId: result.user.id,
        sessionId: result.session.id,
      }, 'Stored auth session in request context')
    } else {
      c.set('user', null)
      c.set('session', null)
      authLogger.info({
        middleware: 'authMiddleware',
        method: c.req.method,
        path: c.req.path,
      }, 'No auth session found; request context set to anonymous')
    }
  } catch (error) {
    c.set('user', null)
    c.set('session', null)
    authLogger.error({
      middleware: 'authMiddleware',
      method: c.req.method,
      path: c.req.path,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    }, 'Auth middleware session lookup failed; falling back to anonymous context')
  }

  await next()
  return
})

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    authLogger.info({
      middleware: 'requireAuth',
      method: c.req.method,
      path: c.req.path,
    }, 'Entering requireAuth middleware')

    const result = await loadSession(c.req.raw.headers)

    if (!result) {
      authLogger.warn({
        middleware: 'requireAuth',
        method: c.req.method,
        path: c.req.path,
      }, 'Rejecting request because no auth session was found')
      return c.json(errorResponse('Unauthorized'), 401)
    }

    if (requiresVerifiedEmail(result.user, result.providerIds)) {
      authLogger.warn({
        middleware: 'requireAuth',
        method: c.req.method,
        path: c.req.path,
        userId: result.user.id,
        providerIds: result.providerIds,
      }, 'Rejecting request because email is not verified')
      return c.json(emailNotVerifiedResponse(), 403)
    }

    c.set('user', result.user)
    c.set('session', result.session)
    authLogger.info({
      middleware: 'requireAuth',
      method: c.req.method,
      path: c.req.path,
      userId: result.user.id,
      sessionId: result.session.id,
    }, 'Authenticated request authorized successfully')
    await next()
    return
  } catch (error) {
    authLogger.error({
      middleware: 'requireAuth',
      method: c.req.method,
      path: c.req.path,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    }, 'requireAuth failed while resolving session')
    return c.json(errorResponse('Unauthorized'), 401)
  }
})

export const requireAdmin = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    authLogger.info({
      middleware: 'requireAdmin',
      method: c.req.method,
      path: c.req.path,
    }, 'Entering requireAdmin middleware')

    const result = await loadSession(c.req.raw.headers)

    if (!result) {
      authLogger.warn({
        middleware: 'requireAdmin',
        method: c.req.method,
        path: c.req.path,
      }, 'Rejecting admin request because no auth session was found')
      return c.json(errorResponse('Unauthorized'), 401)
    }

    if (requiresVerifiedEmail(result.user, result.providerIds)) {
      authLogger.warn({
        middleware: 'requireAdmin',
        method: c.req.method,
        path: c.req.path,
        userId: result.user.id,
        providerIds: result.providerIds,
      }, 'Rejecting admin request because email is not verified')
      return c.json(emailNotVerifiedResponse(), 403)
    }

    if (!hasRole(result.user, ADMIN_ROLE)) {
      authLogger.warn({
        middleware: 'requireAdmin',
        method: c.req.method,
        path: c.req.path,
        userId: result.user.id,
      }, 'Rejecting admin request because user is missing admin role')
      return c.json(errorResponse('Forbidden'), 403)
    }

    c.set('user', result.user)
    c.set('session', result.session)
    authLogger.info({
      middleware: 'requireAdmin',
      method: c.req.method,
      path: c.req.path,
      userId: result.user.id,
      sessionId: result.session.id,
    }, 'Admin request authorized successfully')
    await next()
    return
  } catch (error) {
    authLogger.error({
      middleware: 'requireAdmin',
      method: c.req.method,
      path: c.req.path,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    }, 'requireAdmin failed while resolving session')
    return c.json(errorResponse('Unauthorized'), 401)
  }
})
