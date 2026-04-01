
import { Icon } from "@/components/ui/ion-icon";
import { Stack, useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, Text } from "react-native";

const formSheet = (field: string, detent: number) => ({
    presentation: 'formSheet' as const,
    sheetAllowedDetents: [detent],
    headerShown: false,
    contentStyle: { backgroundColor: field },
})

export default function AppStack() {
    const router = useRouter()
    const field = useThemeColor('field')
    const accent = useThemeColor('accent')
    const background = useThemeColor('background')

    return <Stack screenOptions={{
        headerShown: false,
        headerStyle: {
            backgroundColor: field
        },
        headerTintColor: accent,

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
        <Stack.Screen name="(modal)/language-select" options={formSheet(field, 0.38)} />
        <Stack.Screen name="(modal)/premise-status" options={formSheet(field, 0.45)} />
        <Stack.Screen name="(modal)/premise-attitude" options={formSheet(field, 0.7)} />
        <Stack.Screen name="(modal)/premise-filter" options={formSheet(field, 0.8)} />
        <Stack.Screen name="(modal)/bit-filter" options={formSheet(field, 0.8)} />
        <Stack.Screen name="(modal)/bit-meta" options={formSheet(field, 0.7)} />
        <Stack.Screen name="(modal)/setlist-filter" options={formSheet(field, 0.6)} />
        <Stack.Screen name="(modal)/setlist-add-bit" options={formSheet(field, 0.85)} />
        <Stack.Screen name="(modal)/premise-add-bit" options={formSheet(field, 0.85)} />
        <Stack.Screen name="(modal)/note-bulk-import" options={formSheet(field, 0.85)} />


        <Stack.Screen name="(detail)/note/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="(detail)/note/index" options={{ headerShown: true }} />
        <Stack.Screen name="(detail)/premise/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="(detail)/bit/[id]" options={{ headerShown: true, contentStyle: { backgroundColor: background } }} />
        <Stack.Screen name="(detail)/setlist/[id]" options={{ headerShown: true, contentStyle: { backgroundColor: background } }} />
        <Stack.Screen name="(detail)/setlist/reader" options={{ headerShown: true, contentStyle: { backgroundColor: background } }} />
    </Stack>;
}
