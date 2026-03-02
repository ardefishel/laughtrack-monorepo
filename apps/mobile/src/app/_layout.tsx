import "@/globals.css";
import { database } from "@/database";
import { AuthProvider } from "@/context/auth-context";
import { reconcilePremiseBitLinks } from "@/database/reconcilePremiseBitLinks";
import { reconcileSetlistBitLinks } from "@/database/reconcileSetlistBitLinks";
import { appLogger, dbLogger, navLogger } from "@/lib/loggers";
import { DatabaseProvider } from "@nozbe/watermelondb/react";
import { Slot, usePathname } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
    const pathname = usePathname()
    const prevPathnameRef = useRef<string | undefined>(undefined)
    const appStartTime = useRef(Date.now())

    useEffect(() => {
        appLogger.info('App cold start')

        void reconcilePremiseBitLinks(database)
            .then((count) => dbLogger.info(`Reconciled premise-bit links: ${count} updated`))
            .catch((error: unknown) => dbLogger.error('Failed to reconcile premise-bit links', error))

        void reconcileSetlistBitLinks(database)
            .then((count) => dbLogger.info(`Reconciled setlist-bit links: ${count} updated`))
            .catch((error: unknown) => dbLogger.error('Failed to reconcile setlist-bit links', error))
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

    return <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
            <DatabaseProvider database={database}>
                <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
                    <KeyboardProvider>
                        <Slot />
                    </KeyboardProvider>
                </HeroUINativeProvider>
            </DatabaseProvider>
        </AuthProvider>
    </GestureHandlerRootView>
}
