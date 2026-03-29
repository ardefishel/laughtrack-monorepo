import "@/globals.css";
import { database } from "@/database";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { useAppLifecycle } from "@/lib/app-lifecycle";
import { useStartupTasks } from "@/lib/startup-tasks";
import { DatabaseProvider } from "@nozbe/watermelondb/react";
import { Slot } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
    useAppLifecycle()
    useStartupTasks()

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
