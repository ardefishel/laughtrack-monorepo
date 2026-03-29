import { NOTE_TABLE } from '@/database/constants'
import { useObservedUpdatedList } from '@/database/hooks/use-observed-updated-list'
import { noteModelToDomain } from '../data/note.mapper'
import { Note as NoteModel } from '../data/note.model'
import type { Note } from '@/types'

export function useNoteList(limit?: number) {
    const { items, refresh } = useObservedUpdatedList<NoteModel, Note>({
        table: NOTE_TABLE,
        mapModel: noteModelToDomain,
        limit,
    })

    return {
        notes: items,
        refresh,
    }
}
