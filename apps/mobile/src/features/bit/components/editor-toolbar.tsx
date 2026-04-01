import type { EnrichedTextInputInstance, OnChangeStateEvent } from 'react-native-enriched'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { Pressable, ScrollView, Text, View } from 'react-native'
import type { RefObject } from 'react'

type EditorToolbarProps = {
    editorRef: RefObject<EnrichedTextInputInstance | null>
    stylesState: OnChangeStateEvent | null
    onFormattingIntent: (kind: 'h1' | 'h2' | 'paragraph') => void
}

export function EditorToolbar({ editorRef, stylesState, onFormattingIntent }: EditorToolbarProps) {
    const isH1Active = stylesState?.h1?.isActive ?? false
    const isH2Active = stylesState?.h2?.isActive ?? false
    const isParagraphActive = !isH1Active && !isH2Active
    const toolbarSections = [
        {
            key: 'headings',
            buttons: [
            {
                key: 'h1',
                label: 'H1',
                accessibilityLabel: 'Heading 1',
                isActive: isH1Active,
                isDisabled: stylesState?.h1?.isBlocking ?? false,
                onPress: () => {
                    onFormattingIntent('h1')
                    editorRef.current?.toggleH1()
                },
            },
            {
                key: 'h2',
                label: 'H2',
                accessibilityLabel: 'Heading 2',
                isActive: isH2Active,
                isDisabled: stylesState?.h2?.isBlocking ?? false,
                onPress: () => {
                    onFormattingIntent('h2')
                    editorRef.current?.toggleH2()
                },
            },
            {
                key: 'paragraph',
                label: 'P',
                accessibilityLabel: 'Paragraph',
                isActive: isParagraphActive,
                isDisabled: false,
                onPress: () => {
                    onFormattingIntent('paragraph')
                    if (isH1Active) editorRef.current?.toggleH1()
                    if (isH2Active) editorRef.current?.toggleH2()
                },
            },
            ],
        },
        {
            key: 'inline-styles',
            buttons: [
            {
                key: 'bold',
                label: 'B',
                accessibilityLabel: 'Bold',
                isActive: stylesState?.bold?.isActive ?? false,
                isDisabled: stylesState?.bold?.isBlocking ?? false,
                onPress: () => editorRef.current?.toggleBold(),
            },
            {
                key: 'italic',
                label: 'I',
                accessibilityLabel: 'Italic',
                textClassName: 'italic',
                isActive: stylesState?.italic?.isActive ?? false,
                isDisabled: stylesState?.italic?.isBlocking ?? false,
                onPress: () => editorRef.current?.toggleItalic(),
            },
            {
                key: 'underline',
                label: 'U',
                accessibilityLabel: 'Underline',
                textClassName: 'underline',
                isActive: stylesState?.underline?.isActive ?? false,
                isDisabled: stylesState?.underline?.isBlocking ?? false,
                onPress: () => editorRef.current?.toggleUnderline(),
            },
            {
                key: 'strikeThrough',
                label: 'S',
                accessibilityLabel: 'Strikethrough',
                textClassName: 'line-through',
                isActive: stylesState?.strikeThrough?.isActive ?? false,
                isDisabled: stylesState?.strikeThrough?.isBlocking ?? false,
                onPress: () => editorRef.current?.toggleStrikeThrough(),
            },
            ],
        },
        {
            key: 'block-styles',
            buttons: [
            {
                key: 'unorderedList',
                label: 'UL',
                accessibilityLabel: 'Bullet list',
                isActive: stylesState?.unorderedList?.isActive ?? false,
                isDisabled: stylesState?.unorderedList?.isBlocking ?? false,
                onPress: () => editorRef.current?.toggleUnorderedList(),
            },
            {
                key: 'orderedList',
                label: 'OL',
                accessibilityLabel: 'Numbered list',
                isActive: stylesState?.orderedList?.isActive ?? false,
                isDisabled: stylesState?.orderedList?.isBlocking ?? false,
                onPress: () => editorRef.current?.toggleOrderedList(),
            },
            {
                key: 'blockQuote',
                label: 'Q',
                accessibilityLabel: 'Block quote',
                isActive: stylesState?.blockQuote?.isActive ?? false,
                isDisabled: stylesState?.blockQuote?.isBlocking ?? false,
                onPress: () => editorRef.current?.toggleBlockQuote(),
            },
            ],
        },
    ]

    return (
        <KeyboardStickyView offset={{ closed: 0, opened: 0 }} className='absolute bottom-0 right-0 left-0'>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                className='bg-surface border-t border-separator'
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', gap: 8 }}
            >
                {toolbarSections.map((section, sectionIndex) => (
                    <View key={section.key} className='flex-row items-center gap-2'>
                        {section.buttons.map((button) => (
                            <ToolbarButton
                                key={button.key}
                                label={button.label}
                                accessibilityLabel={button.accessibilityLabel}
                                textClassName={button.textClassName}
                                isActive={button.isActive}
                                isDisabled={button.isDisabled}
                                onPress={button.onPress}
                            />
                        ))}
                        {sectionIndex < toolbarSections.length - 1 ? <View className='w-px h-5 bg-separator mx-1' /> : null}
                    </View>
                ))}
            </ScrollView>
        </KeyboardStickyView>
    )
}

function ToolbarButton({
    label,
    accessibilityLabel,
    textClassName,
    isActive,
    isDisabled,
    onPress,
}: {
    label: string
    accessibilityLabel: string
    textClassName?: string
    isActive: boolean
    isDisabled: boolean
    onPress: () => void
}) {
    return (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ selected: isActive, disabled: isDisabled }}
            disabled={isDisabled}
            onPress={onPress}
            className={`px-3 py-1.5 rounded-lg ${isActive ? 'bg-accent' : 'bg-default'} ${isDisabled ? 'opacity-40' : ''}`}
        >
            <Text className={`text-sm font-bold ${isActive ? 'text-accent-foreground' : 'text-foreground'} ${textClassName ?? ''}`}>
                {label}
            </Text>
        </Pressable>
    )
}
