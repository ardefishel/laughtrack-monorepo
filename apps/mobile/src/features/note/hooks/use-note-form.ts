import { noteModelToDomain } from '../data/note.mapper'
import { Note as NoteModel } from '../data/note.model'
import { timeAgo } from '@/lib/time-ago'
import { createNote, promoteNoteToPremise } from '@/features/note/services/note-actions'
import { NOTE_TABLE } from '@/database/constants'
import type { Note } from '@/types'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Alert } from 'react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function useNoteForm() {
    const router = useRouter()
    const database = useDatabase()
    const { id } = useLocalSearchParams<{ id: string }>()
    const isEditing = id !== 'new'

    const [noteState, setNoteState] = useState<{ note: NoteModel; key: number } | null>(null)
    const [noteData, setNoteData] = useState<Note | null>(null)
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!isEditing || !id) {
            setNoteState(null)
            setNoteData(null)
            setContent('')
            return
        }

        const subscription = database
            .get<NoteModel>(NOTE_TABLE)
            .findAndObserve(id)
            .subscribe((result: NoteModel) => {
                setNoteState({ note: result, key: result.updatedAt.getTime() })
                setNoteData(noteModelToDomain(result))
                setContent(result.content)
            })

        return () => subscription.unsubscribe()
    }, [database, id, isEditing])

    const canSave = useMemo(() => content.trim().length > 0 && !isSaving, [content, isSaving])

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

            await createNote(database, trimmed)
            router.back()
        } finally {
            setIsSaving(false)
        }
    }, [content, database, isEditing, isSaving, noteState?.note, router])

    const handlePromoteToPremise = useCallback(() => {
        if (!isEditing || !noteState?.note) return

        const trimmed = content.trim()
        if (!trimmed) return

        Alert.alert(
            'Promote to Premise',
            'This will create a new premise from this note and delete the original note.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Promote',
                    onPress: async () => {
                        setIsSaving(true)

                        try {
                            const premiseId = await promoteNoteToPremise(database, noteState.note, trimmed)
                            router.replace({ pathname: '/(app)/(detail)/premise/[id]', params: { id: premiseId } })
                        } finally {
                            setIsSaving(false)
                        }
                    },
                },
            ],
        )
    }, [content, database, isEditing, noteState?.note, router])

    const detailMeta = useMemo(() => {
        if (!noteData) return null

        const value = timeAgo(noteData.updatedAt)
        return `Updated ${value === 'Just now' ? 'just now' : value}`
    }, [noteData])

    return {
        isEditing,
        content,
        setContent,
        canSave,
        detailMeta,
        isSaving,
        canPromoteToPremise: isEditing,
        handleSave,
        handlePromoteToPremise,
    }
}
