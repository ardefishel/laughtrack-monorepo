import { createMiddleware } from 'hono/factory'
import { ulid } from 'ulid'
import { defaultLogger } from '@laughtrack/logger/node'

type LoggerEnv = {
  Variables: {
    requestId: string
    startTime: number
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
    const logEntry = {
      requestId,
      method: c.req.method,
      url: c.req.url,
      status: c.res.status,
      duration: `${duration}ms`,
      userAgent: c.req.header('User-Agent'),
    }

    try {
      defaultLogger.info(JSON.stringify(logEntry))
    } catch {
      // Fallback logging if JSON.stringify fails
      defaultLogger.info(`[${requestId}] ${c.req.method} ${c.req.url} ${c.res.status} ${duration}ms`)
    }
  })
}
