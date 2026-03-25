import { BitPremiseStrip } from '@/features/bit/components/bit-premise-strip'
import { EditorToolbar } from '@/features/bit/components/editor-toolbar'
import { useBitEditor } from '@/features/bit/hooks/use-bit-editor'
import { useBitForm } from '@/features/bit/hooks/use-bit-form'
import { useI18n } from '@/i18n'
import { useNavigation } from 'expo-router'
import { Button, useThemeColor } from 'heroui-native'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { EnrichedTextInput } from 'react-native-enriched'

export default function BitDetailScreen() {
    const navigation = useNavigation('/(app)')
    const { t } = useI18n()
    const [isPremiseExpanded, setIsPremiseExpanded] = useState(false)

    const {
        isEditing,
        setContent,
        editorInitialValue,
        editorKey,
        premiseId,
        linkedPremiseContent,
        canSave,
        handleSave,
        openBitMeta,
    } = useBitForm()

    const {
        editorRef,
        stylesState,
        onChangeText,
        onChangeHtml,
        onChangeState,
        onKeyPress,
        markFormattingIntent,
        syncSnapshot,
    } = useBitEditor({ onContentChange: setContent })

    const handleEditorSave = useCallback(async () => {
        const latestHtml = await editorRef.current?.getHTML().catch(() => null)
        await handleSave(latestHtml ?? undefined)
    }, [editorRef, handleSave])

    const foreground = useThemeColor('foreground')
    const muted = useThemeColor('muted')
    const accent = useThemeColor('accent')
    const headerTitle = isEditing ? t('bit.detail.editTitle') : t('bit.detail.newTitle')
    const metaLabel = t('bit.detail.meta')
    const saveLabel = isEditing ? t('bit.detail.save') : t('bit.detail.create')

    useEffect(() => {
        syncSnapshot(editorInitialValue)
    }, [editorInitialValue, syncSnapshot])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle,
            headerRight: () => (
                <View className='flex-row items-center gap-1'>
                    <Button size='sm' variant='ghost' onPress={openBitMeta}>
                        <Button.Label className='text-accent font-semibold'>{metaLabel}</Button.Label>
                    </Button>

                    <Button size='sm' variant='ghost' onPress={handleEditorSave} isDisabled={!canSave}>
                        <Button.Label className='text-accent font-semibold'>{saveLabel}</Button.Label>
                    </Button>
                </View>
            ),
        })
    }, [canSave, handleEditorSave, headerTitle, metaLabel, navigation, openBitMeta, saveLabel])

    return (
        <View className='flex-1 bg-background'>
            {premiseId && (
                <BitPremiseStrip
                    premiseId={premiseId}
                    linkedPremiseContent={linkedPremiseContent}
                    isExpanded={isPremiseExpanded}
                    onToggle={() => setIsPremiseExpanded((prev) => !prev)}
                />
            )}

            <ScrollView
                className='flex-1'
                contentContainerClassName='px-4 pt-4 pb-32'
                keyboardShouldPersistTaps='handled'
            >
                <EnrichedTextInput
                    key={editorKey}
                    ref={editorRef}
                    defaultValue={editorInitialValue}
                    onChangeText={onChangeText}
                    onChangeHtml={onChangeHtml}
                    onChangeState={onChangeState}
                    onKeyPress={onKeyPress}
                    htmlStyle={{
                        h1: { fontSize: 28, bold: true },
                        h2: { fontSize: 22, bold: true },
                        blockquote: {
                            borderColor: accent,
                            borderWidth: 3,
                            gapWidth: 12,
                            color: muted,
                        },
                        ol: {
                            gapWidth: 10,
                            marginLeft: 20,
                            markerColor: foreground,
                            markerFontWeight: '600',
                        },
                        ul: {
                            gapWidth: 10,
                            marginLeft: 20,
                            bulletColor: foreground,
                            bulletSize: 7,
                        },
                    }}
                    style={{
                        fontSize: 17,
                        lineHeight: 26,
                        color: foreground,
                        minHeight: 300,
                    }}
                    placeholder={t('bit.detail.placeholder')}
                    placeholderTextColor={muted}
                    cursorColor={accent}
                    selectionColor={accent}
                />
            </ScrollView>

            <EditorToolbar editorRef={editorRef} stylesState={stylesState} onFormattingIntent={markFormattingIntent} />
        </View>
    )
}
