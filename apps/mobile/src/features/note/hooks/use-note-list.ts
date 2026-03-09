import { NOTE_TABLE } from '@/database/constants'
import { useObservedUpdatedList } from '@/database/hooks/use-observed-updated-list'
import { noteModelToDomain } from '@/database/mappers/noteMapper'
import { Note as NoteModel } from '@/database/models/note'
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
