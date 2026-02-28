import { NOTE_TABLE } from '@/database/constants'
import { Note as NoteModel } from '@/database/models/note'
import type { Note } from '@/types'
import { timeAgo } from '@/utils/time-ago'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { Button, TextArea } from 'heroui-native'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'

function toNote(model: NoteModel): Note {
    return {
        id: model.id,
        content: model.content,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }
}

export default function NoteDetail() {
    const router = useRouter()
    const database = useDatabase()
    const { id } = useLocalSearchParams<{ id: string }>()
    const isEditing = id !== 'new'

    const navigation = useNavigation('/(app)')

    const [noteState, setNoteState] = useState<{ note: NoteModel; key: number } | null>(null)
    const [noteData, setNoteData] = useState<Note | null>(null)
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!isEditing || !id) {
            setNoteState(null)
            setNoteData(null)
            return
        }

        const subscription = database
            .get<NoteModel>(NOTE_TABLE)
            .findAndObserve(id)
            .subscribe((result: NoteModel) => {
                setNoteState({ note: result, key: result.updatedAt.getTime() })
                setNoteData(toNote(result))
                setContent(result.content)
            })

        return () => subscription.unsubscribe()
    }, [database, id, isEditing])

    const canSave = content.trim().length > 0 && !isSaving

    const handleSave = useCallback(async () => {
        const trimmed = content.trim()
        if (!trimmed || isSaving) return

        setIsSaving(true)

        try {
            if (isEditing && noteState?.note) {
                await noteState.note.updateContent(trimmed)
                router.back()
                return
            }

            await database.write(async () => {
                await database.get<NoteModel>(NOTE_TABLE).create((note: NoteModel) => {
                    const now = Date.now()
                    note.content = trimmed
                    note.createdAt = new Date(now)
                    note.updatedAt = new Date(now)
                })
            })
            router.back()
        } finally {
            setIsSaving(false)
        }
    }, [content, database, isEditing, isSaving, noteState?.note, router])

    const detailMeta = noteData
        ? (() => {
            const value = timeAgo(noteData.updatedAt)
            return `Updated ${value === 'Just now' ? 'just now' : value}`
        })()
        : null

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
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
