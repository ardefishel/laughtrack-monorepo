import "@/globals.css";
import { database } from "@/database";
import { reconcilePremiseBitLinks } from "@/database/reconcilePremiseBitLinks";
import { reconcileSetlistBitLinks } from "@/database/reconcileSetlistBitLinks";
import { DatabaseProvider } from "@nozbe/watermelondb/react";
import { Slot } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
    useEffect(() => {
        void reconcilePremiseBitLinks(database).catch((error: unknown) => {
            console.error('Failed to reconcile premise-bit links', error)
        })

        void reconcileSetlistBitLinks(database).catch((error: unknown) => {
            console.error('Failed to reconcile setlist-bit links', error)
        })
    }, [])

    return <GestureHandlerRootView style={{ flex: 1 }}>
        <DatabaseProvider database={database}>
            <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
                <KeyboardProvider>
                    <Slot />
                </KeyboardProvider>
            </HeroUINativeProvider>
        </DatabaseProvider>
    </GestureHandlerRootView>
}
