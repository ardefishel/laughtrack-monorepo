import type { OnChangeStateEvent } from 'react-native-enriched'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { Pressable, Text, View } from 'react-native'

type EditorToolbarProps = {
    stylesState: OnChangeStateEvent | null
    onRunParagraphCommand: (command: 'h1' | 'h2' | 'paragraph') => void
}

export function EditorToolbar({ stylesState, onRunParagraphCommand }: EditorToolbarProps) {
    const isH1Active = stylesState?.h1?.isActive ?? false
    const isH2Active = stylesState?.h2?.isActive ?? false
    const isParagraphActive = !isH1Active && !isH2Active

    return (
        <KeyboardStickyView offset={{ closed: 0, opened: 0 }} className='absolute bottom-0 right-0 left-0'>
            <View className='flex-row items-center gap-2 px-4 py-2.5 bg-surface border-t border-separator'>
                <ToolbarButton label='H1' isActive={isH1Active} onPress={() => onRunParagraphCommand('h1')} />
                <ToolbarButton label='H2' isActive={isH2Active} onPress={() => onRunParagraphCommand('h2')} />
                <View className='w-px h-5 bg-separator mx-1' />
                <ToolbarButton
                    label='P'
                    isActive={isParagraphActive}
                    onPress={() => onRunParagraphCommand('paragraph')}
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
        <Pressable onPressIn={onPress} className={`px-3.5 py-1.5 rounded-lg ${isActive ? 'bg-accent' : 'bg-default'}`}>
            <Text className={`text-sm font-bold ${isActive ? 'text-accent-foreground' : 'text-foreground'}`}>
                {label}
            </Text>
        </Pressable>
    )
}
