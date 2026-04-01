import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { usePathname } from 'expo-router'
import { appLogger, navLogger } from '@/lib/loggers'

export function useAppLifecycle() {
    const pathname = usePathname()
    const prevPathnameRef = useRef<string | undefined>(undefined)
    const appStartTime = useRef(Date.now())

    useEffect(() => {
        appLogger.info('App cold start')
    }, [])

    useEffect(() => {
        const handler = (nextState: AppStateStatus) => {
            appLogger.info(`AppState → ${nextState}`)
        }
        const subscription = AppState.addEventListener('change', handler)
        return () => subscription.remove()
    }, [])

    useEffect(() => {
        if (!prevPathnameRef.current) {
            const startupMs = Date.now() - appStartTime.current
            appLogger.info(`App ready in ${startupMs}ms — initial screen: ${pathname}`)
        } else if (prevPathnameRef.current !== pathname) {
            navLogger.info(`${prevPathnameRef.current} → ${pathname}`)
        }
        prevPathnameRef.current = pathname
    }, [pathname])
}
