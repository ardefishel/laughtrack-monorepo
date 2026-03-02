import { buildSetlistReaderHtml } from '@/lib/buildSetlistReaderHtml'
import type { SetlistItem } from '@/types'
import { useKeepAwake } from 'expo-keep-awake'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useThemeColor } from 'heroui-native'
import { useLayoutEffect, useMemo } from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'

export default function SetlistReaderScreen() {
    const { title, items: itemsJson } = useLocalSearchParams<{ title: string; items: string }>()
    const navigation = useNavigation('/(app)')

    useKeepAwake()

    const background = useThemeColor('background')
    const foreground = useThemeColor('foreground')
    const muted = useThemeColor('muted')
    const accent = useThemeColor('accent')
    const surface = useThemeColor('field')

    useLayoutEffect(() => {
        navigation.setOptions({ headerTitle: title || 'Reader' })
    }, [navigation, title])

    const html = useMemo(() => {
        let parsed: SetlistItem[] = []
        try {
            parsed = JSON.parse(itemsJson || '[]') as SetlistItem[]
        } catch {
            parsed = []
        }

        return buildSetlistReaderHtml(parsed, title || '', {
            background,
            foreground,
            muted,
            accent,
            surface,
        })
    }, [itemsJson, title, background, foreground, muted, accent, surface])

    return (
        <View className="flex-1 bg-background">
            <WebView
                source={{ html }}
                style={{ backgroundColor: 'transparent' }}
                scrollEnabled
                showsVerticalScrollIndicator={false}
                originWhitelist={['*']}
            />
        </View>
    )
}
