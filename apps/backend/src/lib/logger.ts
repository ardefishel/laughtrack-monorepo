import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

const baseLogger = pino({
  level: isProduction ? 'warn' : 'debug',
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }),
})

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
