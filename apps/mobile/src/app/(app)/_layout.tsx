
import { Icon } from "@/components/ui/ion-icon";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, Text } from "react-native";

export default function AppStack() {
    return <Stack screenOptions={{
        headerShown: false,
        headerStyle: {
            backgroundColor: useThemeColor('field')
        },
        headerTintColor: useThemeColor('accent'),

        headerLeft({ tintColor, canGoBack }) {
            if (!canGoBack) return null
            return (
                <Pressable onPress={() => router.back()} className="flex-row items-center -translate-x-2">
                    <Icon name="chevron-back" size={24} color={tintColor} />
                    <Text className="text-accent text-md">Back</Text>
                </Pressable>
            )
        },
    }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/forgot-password" />

        <Stack.Screen name="(modal)/action-sheet" options={{ presentation: "formSheet" }} />
        <Stack.Screen name="(modal)/premise-filter" options={{ presentation: "formSheet", sheetAllowedDetents: [0.8], headerShown: false, contentStyle: { backgroundColor: useThemeColor('field') } }} />
        <Stack.Screen name="(modal)/bit-filter" options={{ presentation: "formSheet", sheetAllowedDetents: [0.8], headerShown: false, contentStyle: { backgroundColor: useThemeColor('field') } }} />
        <Stack.Screen name="(modal)/bit-meta" options={{ presentation: "formSheet", sheetAllowedDetents: [0.7], headerShown: false, contentStyle: { backgroundColor: useThemeColor('field') } }} />
        <Stack.Screen name="(modal)/setlist-filter" options={{ presentation: "formSheet", sheetAllowedDetents: [0.6], headerShown: false, contentStyle: { backgroundColor: useThemeColor('field') } }} />
        <Stack.Screen name="(modal)/setlist-add-bit" options={{ presentation: "formSheet", sheetAllowedDetents: [0.85], headerShown: false, contentStyle: { backgroundColor: useThemeColor('field') } }} />
        <Stack.Screen name="(modal)/premise-add-bit" options={{ presentation: "formSheet", sheetAllowedDetents: [0.85], headerShown: false, contentStyle: { backgroundColor: useThemeColor('field') } }} />


        <Stack.Screen name="(detail)/note/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="(detail)/note/index" options={{ headerShown: true }} />
        <Stack.Screen name="(detail)/premise/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="(detail)/bit/[id]" options={{ headerShown: true, contentStyle: { backgroundColor: useThemeColor('background') } }} />
        <Stack.Screen name="(detail)/setlist/[id]" options={{ headerShown: true, contentStyle: { backgroundColor: useThemeColor('background') } }} />
    </Stack>;
}
