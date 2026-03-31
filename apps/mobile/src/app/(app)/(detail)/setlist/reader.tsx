import { buildSetlistReaderHtml } from '@/features/setlist/reader/buildSetlistReaderHtml'
import { useI18n } from '@/i18n'
import { uiLogger } from '@/lib/loggers'
import type { SetlistItem } from '@/types'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useThemeColor } from 'heroui-native'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'

export default function SetlistReaderScreen() {
    const { title, items: itemsJson } = useLocalSearchParams<{ title: string; items: string }>()
    const navigation = useNavigation('/(app)')
    const { t } = useI18n()
    const resolvedTitle = title || t('setlist.readerTitle')

    useEffect(() => {
        void activateKeepAwakeAsync().catch(() => {
            uiLogger.debug('expo-keep-awake: native module not available, skipping')
        })
        return () => {
            deactivateKeepAwake()
        }
    }, [])

    const background = useThemeColor('background')
    const foreground = useThemeColor('foreground')
    const muted = useThemeColor('muted')
    const accent = useThemeColor('accent')
    const surface = useThemeColor('field')

    useLayoutEffect(() => {
        navigation.setOptions({ headerTitle: resolvedTitle })
    }, [navigation, resolvedTitle])

    const html = useMemo(() => {
        let parsed: SetlistItem[] = []
        try {
            const raw = JSON.parse(itemsJson || '[]')
            if (!Array.isArray(raw)) {
                uiLogger.debug('SetlistReader items payload is not an array')
                parsed = []
            } else {
                parsed = raw.filter(
                    (item: unknown): item is SetlistItem =>
                        typeof item === 'object' && item !== null && 'type' in item &&
                        (item.type === 'bit' || item.type === 'set-note')
                )
            }
        } catch (error) {
            uiLogger.debug('SetlistReader failed to parse items payload', {
                itemsJson,
                error,
            })
            parsed = []
        }

        return buildSetlistReaderHtml(parsed, resolvedTitle, {
            background,
            foreground,
            muted,
            accent,
            surface,
        })
    }, [itemsJson, resolvedTitle, background, foreground, muted, accent, surface])

    return (
        <View className="flex-1 bg-background">
            <WebView
                source={{ html }}
                style={{ backgroundColor: 'transparent' }}
                scrollEnabled
                showsVerticalScrollIndicator={false}
                originWhitelist={['about:blank']}
            />
        </View>
    )
}
