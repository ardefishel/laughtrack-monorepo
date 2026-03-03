import type { EnrichedTextInputInstance, OnChangeStateEvent } from 'react-native-enriched'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { Pressable, Text, View } from 'react-native'
import type { RefObject } from 'react'

type EditorToolbarProps = {
    editorRef: RefObject<EnrichedTextInputInstance | null>
    stylesState: OnChangeStateEvent | null
}

export function EditorToolbar({ editorRef, stylesState }: EditorToolbarProps) {
    const isH1Active = stylesState?.h1?.isActive ?? false
    const isH2Active = stylesState?.h2?.isActive ?? false
    const isParagraphActive = !isH1Active && !isH2Active

    return (
        <KeyboardStickyView offset={{ closed: 0, opened: 0 }} className='absolute bottom-0 right-0 left-0'>
            <View className='flex-row items-center gap-2 px-4 py-2.5 bg-surface border-t border-separator'>
                <ToolbarButton label='H1' isActive={isH1Active} onPress={() => editorRef.current?.toggleH1()} />
                <ToolbarButton label='H2' isActive={isH2Active} onPress={() => editorRef.current?.toggleH2()} />
                <View className='w-px h-5 bg-separator mx-1' />
                <ToolbarButton
                    label='P'
                    isActive={isParagraphActive}
                    onPress={() => {
                        if (isH1Active) editorRef.current?.toggleH1()
                        if (isH2Active) editorRef.current?.toggleH2()
                    }}
                />
            </View>
        </KeyboardStickyView>
    )
}

function ToolbarButton({
    label,
    isActive,
    onPress,
}: {
    label: string
    isActive: boolean
    onPress: () => void
}) {
    return (
        <Pressable onPress={onPress} className={`px-3.5 py-1.5 rounded-lg ${isActive ? 'bg-accent' : 'bg-default'}`}>
            <Text className={`text-sm font-bold ${isActive ? 'text-accent-foreground' : 'text-foreground'}`}>
                {label}
            </Text>
        </Pressable>
    )
}
