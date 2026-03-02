import "@/globals.css";
import { Slot } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayoutWeb() {
    return <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
            <KeyboardProvider>
                <Slot />
            </KeyboardProvider>
        </HeroUINativeProvider>
    </GestureHandlerRootView>
}
