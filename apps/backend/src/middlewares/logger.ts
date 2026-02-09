import { createMiddleware } from 'hono/factory'
import { ulid } from 'ulid'

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
    const log = {
      requestId,
      method: c.req.method,
      url: c.req.url,
      status: c.res.status,
      duration: `${duration}ms`,
      userAgent: c.req.header('User-Agent'),
    }

    try {
      console.log(JSON.stringify(log))
    } catch {
      // Fallback logging if JSON.stringify fails
      console.log(`[${requestId}] ${c.req.method} ${c.req.url} ${c.res.status} ${duration}ms`)
    }
  })
}
