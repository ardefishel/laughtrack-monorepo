import { createMiddleware } from 'hono/factory'
import { ZodError } from 'zod'

type ErrorEnv = {
  Variables: {
    error: Error | ZodError | null
    requestId: string
  }
}

export const errorMiddleware = () => {
  return createMiddleware<ErrorEnv>(async (c, next) => {
    try {
      await next()
    } catch (error) {
      const requestId = c.get('requestId') ?? 'unknown'

      if (error instanceof ZodError) {
        return c.json(
          {
            error: 'Validation error',
            requestId,
            details: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        )
      }

      if (error instanceof Error) {
        console.error(`[${requestId}] Error:`, error.message)

        return c.json(
          {
            error: error.message,
            requestId,
          },
          error.message === 'Unauthorized' ? 401 : 500
        )
      }

      console.error(`[${requestId}] Unknown error:`, error)
      return c.json(
        {
          error: 'Internal server error',
          requestId,
        },
        500
      )
    }
    return
  })
}
