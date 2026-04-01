type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const VALID_LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error']

const isProduction = process.env.NODE_ENV === 'production'

function parseLogLevel(value: string | undefined): LogLevel | null {
  if (!value) return null

  const normalizedValue = value.trim().toLowerCase()
  return VALID_LOG_LEVELS.includes(normalizedValue as LogLevel) ? (normalizedValue as LogLevel) : null
}

function isTruthyEnv(value: string | undefined): boolean {
  return value === '1' || value === 'true'
}

const configuredMinLevel = parseLogLevel(process.env.LOG_LEVEL)
const verboseLogsEnabled =
  isTruthyEnv(process.env.BACKEND_VERBOSE_LOGS?.toLowerCase()) ||
  isTruthyEnv(process.env.VERBOSE_LOGS?.toLowerCase())
const minLevel: LogLevel = configuredMinLevel ?? (verboseLogsEnabled ? 'debug' : isProduction ? 'info' : 'debug')

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel]
}

function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg
      if (arg instanceof Error) return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg)
        } catch {
          return String(arg)
        }
      }
      return String(arg)
    })
    .join(' ')
}

interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

function createNamespacedLogger(namespace: string): Logger {
  const tag = namespace.toUpperCase()

  function log(level: LogLevel, ...args: unknown[]): void {
    if (!shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const message = formatArgs(args)

    if (isProduction) {
      // Structured JSON for Vercel log drain
      const entry = { timestamp, level, namespace: tag, msg: message }
      const output = JSON.stringify(entry)
      if (level === 'error') {
        console.error(output)
      } else if (level === 'warn') {
        console.warn(output)
      } else {
        console.log(output)
      }
    } else {
      // Pretty output for local dev
      const output = `[${timestamp}] [${tag}] ${message}`
      switch (level) {
        case 'debug':
          console.debug(output)
          break
        case 'info':
          console.info(output)
          break
        case 'warn':
          console.warn(output)
          break
        case 'error':
          console.error(output)
          break
      }
    }
  }

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
  }
}

export const defaultLogger = createNamespacedLogger('default')
export const authLogger = createNamespacedLogger('auth')
export const dbLogger = createNamespacedLogger('db')
export const serverLogger = createNamespacedLogger('server')
export const hooksLogger = createNamespacedLogger('hooks')
export const uiLogger = createNamespacedLogger('ui')
export const networkLogger = createNamespacedLogger('network')

export { createNamespacedLogger }
export type { Logger, LogLevel }
