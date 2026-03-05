import { logger, consoleTransport } from 'react-native-logs'

declare const __DEV__: boolean

const isDev = typeof __DEV__ !== 'undefined' && __DEV__

const rootLogger = logger.createLogger({
    severity: isDev ? 'debug' : 'warn',
    async: !isDev,
    transport: consoleTransport,
    transportOptions: {
        colors: {
            debug: 'white',
            info: 'blueBright',
            warn: 'yellowBright',
            error: 'redBright',
        },
    },
    printLevel: true,
    printDate: true,
})

export const authLogger = rootLogger.extend('AUTH')
export const syncLogger = rootLogger.extend('SYNC')
export const dbLogger = rootLogger.extend('DB')
export const navLogger = rootLogger.extend('NAV')
export const uiLogger = rootLogger.extend('UI')
export const networkLogger = rootLogger.extend('NETWORK')
export const appLogger = rootLogger.extend('APP')
