import { BitPremiseStrip } from '@/components/feature/material/bit-premise-strip'
import { EditorToolbar } from '@/components/feature/material/editor-toolbar'
import { useBitEditor } from '@/hooks/use-bit-editor'
import { useBitForm } from '@/hooks/use-bit-form'
import { useNavigation } from 'expo-router'
import { Button, useThemeColor } from 'heroui-native'
import { useEffect, useLayoutEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { EnrichedTextInput } from 'react-native-enriched'

export default function BitDetailScreen() {
    const navigation = useNavigation('/(app)')
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

    const { editorRef, stylesState, onChangeText, onChangeHtml, onChangeState, onKeyPress, syncSnapshot } =
        useBitEditor({ onContentChange: setContent })

    const foreground = useThemeColor('foreground')
    const muted = useThemeColor('muted')
    const accent = useThemeColor('accent')

    useEffect(() => {
        syncSnapshot(editorInitialValue)
    }, [editorInitialValue, syncSnapshot])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isEditing ? 'Edit Bit' : 'New Bit',
            headerRight: () => (
                <View className='flex-row items-center gap-1'>
                    <Button size='sm' variant='ghost' onPress={openBitMeta}>
                        <Button.Label className='text-accent font-semibold'>Meta</Button.Label>
                    </Button>

                    <Button size='sm' variant='ghost' onPress={handleSave} isDisabled={!canSave}>
                        <Button.Label className='text-accent font-semibold'>
                            {isEditing ? 'Save' : 'Create'}
                        </Button.Label>
                    </Button>
                </View>
            ),
        })
    }, [canSave, handleSave, isEditing, navigation, openBitMeta])

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
                contentContainerClassName='px-4 pt-4 pb-28'
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
                    }}
                    style={{
                        fontSize: 17,
                        lineHeight: 26,
                        color: foreground,
                        minHeight: 300,
                    }}
                    placeholder='Start writing your bit...'
                    placeholderTextColor={muted}
                    cursorColor={accent}
                    selectionColor={accent}
                />
            </ScrollView>

            <EditorToolbar editorRef={editorRef} stylesState={stylesState} />
        </View>
    )
}
