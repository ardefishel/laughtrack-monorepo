import { createMiddleware } from 'hono/factory'
import { ulid } from 'ulid'
import { defaultLogger } from '@laughtrack/logger/node'

type LoggerEnv = {
  Variables: {
    requestId: string
    startTime: number
  }
}

function sanitizeRequestUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.searchParams.has('token')) {
      parsedUrl.searchParams.set('token', '[REDACTED]')
    }
    return parsedUrl.toString()
  } catch {
    return url.replace(/([?&]token=)[^&]+/i, '$1[REDACTED]')
  }
}

export const loggerMiddleware = () => {
  return createMiddleware<LoggerEnv>(async (c, next) => {
    const requestId = c.req.header('X-Request-ID') ?? ulid()
    const startTime = Date.now()

    c.set('requestId', requestId)
    c.set('startTime', startTime)

    await next()

    const duration = Date.now() - startTime
    const sanitizedUrl = sanitizeRequestUrl(c.req.url)
    const logEntry = {
      requestId,
      method: c.req.method,
      url: sanitizedUrl,
      status: c.res.status,
      duration: `${duration}ms`,
      userAgent: c.req.header('User-Agent'),
    }

    try {
      defaultLogger.info(JSON.stringify(logEntry))
    } catch {
      // Fallback logging if JSON.stringify fails
      defaultLogger.info(`[${requestId}] ${c.req.method} ${sanitizedUrl} ${c.res.status} ${duration}ms`)
    }
  })
}

export { sanitizeRequestUrl }
