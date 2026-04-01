import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

function createPinoOptions(): pino.LoggerOptions {
  const options: pino.LoggerOptions = {
    level: isProduction ? 'warn' : 'debug',
  }

  // Only use pino-pretty transport in development.
  // In production (Vercel), pino outputs JSON to stdout — no worker threads, no file writes.
  if (!isProduction) {
    try {
      require.resolve('pino-pretty')
      options.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    } catch {
      // pino-pretty not installed (e.g. production install), fall through to JSON output
    }
  }

  return options
}

const baseLogger = pino(createPinoOptions())

function createNamespacedLogger(namespace: string) {
  return baseLogger.child({ namespace })
}

export const defaultLogger = createNamespacedLogger('default')
export const dbLogger = createNamespacedLogger('db')
export const serverLogger = createNamespacedLogger('server')
export const hooksLogger = createNamespacedLogger('hooks')
export const uiLogger = createNamespacedLogger('ui')
export const networkLogger = createNamespacedLogger('network')

export { createNamespacedLogger, baseLogger }
