import "@/globals.css";
import { database } from "@/database";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { reconcilePremiseBitLinks } from "@/features/premise/services/premise-bit-links";
import { reconcileSetlistBitLinks } from "@/features/setlist/services/setlist-bit-links";
import { registerAppDevMenuItems } from "@/lib/dev-menu";
import { appLogger, dbLogger, navLogger } from "@/lib/loggers";
import { DatabaseProvider } from "@nozbe/watermelondb/react";
import { Slot, usePathname } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus, InteractionManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
    const pathname = usePathname()
    const prevPathnameRef = useRef<string | undefined>(undefined)
    const appStartTime = useRef(Date.now())

    useEffect(() => {
        appLogger.info('App cold start')

        const task = InteractionManager.runAfterInteractions(() => {
            void reconcilePremiseBitLinks(database)
                .then((count) => dbLogger.info(`Reconciled premise-bit links: ${count} updated`))
                .catch((error: unknown) => dbLogger.error('Failed to reconcile premise-bit links', error))

            void reconcileSetlistBitLinks(database)
                .then((count) => dbLogger.info(`Reconciled setlist-bit links: ${count} updated`))
                .catch((error: unknown) => dbLogger.error('Failed to reconcile setlist-bit links', error))
        })

        return () => task.cancel()
    }, [])

    useEffect(() => {
        registerAppDevMenuItems()
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
        <I18nProvider>
            <AuthProvider>
                <DatabaseProvider database={database}>
                    <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
                        <KeyboardProvider>
                            <Slot />
                        </KeyboardProvider>
                    </HeroUINativeProvider>
                </DatabaseProvider>
            </AuthProvider>
        </I18nProvider>
    </GestureHandlerRootView>
}
