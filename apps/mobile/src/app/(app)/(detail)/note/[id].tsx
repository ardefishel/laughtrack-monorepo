import { Icon } from '@/components/ui/ion-icon'
import { useNoteForm } from '@/features/note/hooks/use-note-form'
import { useNavigation } from 'expo-router'
import { Button, TextArea } from 'heroui-native'
import React, { useLayoutEffect } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'

export default function NoteDetail() {
    const navigation = useNavigation('/(app)')
    const {
        isEditing,
        content,
        setContent,
        canSave,
        detailMeta,
        isSaving,
        canPromoteToPremise,
        handleSave,
        handlePromoteToPremise,
    } = useNoteForm()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isEditing ? 'Note Detail' : 'New Note',
            headerRight: () => (
                <Button size='sm' variant='ghost' onPress={handleSave} isDisabled={!canSave}>
                    <Button.Label className='text-accent font-semibold'>
                        {isEditing ? 'Save' : 'Create'}
                    </Button.Label>
                </Button>
            ),
        })
    }, [canSave, handleSave, isEditing, navigation])

    return (
        <KeyboardAvoidingView
            className='flex-1 bg-background'
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView className='flex-1' contentContainerClassName='px-4 pt-6 pb-24 gap-5'>
                <View className='gap-2'>
                    <Text className='text-muted text-xs tracking-[2px] font-semibold uppercase'>Content</Text>
                    <TextArea
                        value={content}
                        onChangeText={setContent}
                        placeholder='Write your note idea...'
                        className='min-h-[180px] text-[17px] leading-6'
                    />
                </View>
                {detailMeta && (
                    <Text className='text-muted text-xs px-3'>{detailMeta}</Text>
                )}

                {canPromoteToPremise && (
                    <View className='pt-4 border-t border-separator'>
                        <Pressable
                            onPress={handlePromoteToPremise}
                            disabled={isSaving || !content.trim()}
                            className='flex-row items-center gap-3 px-3 py-3 rounded-xl active:opacity-70'
                        >
                            <View className='size-8 rounded-lg bg-accent/15 items-center justify-center'>
                                <Icon name='arrow-up-circle-outline' size={18} className='text-accent' />
                            </View>
                            <View className='flex-1'>
                                <Text className='text-foreground text-[15px] font-medium'>Promote to Premise</Text>
                                <Text className='text-muted text-xs'>Convert this note into a draft premise</Text>
                            </View>
                            <Icon name='chevron-forward' size={16} className='text-muted' />
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
