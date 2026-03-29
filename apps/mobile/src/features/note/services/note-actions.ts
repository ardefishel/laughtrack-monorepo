import type { Database } from '@nozbe/watermelondb'
import { NOTE_TABLE, PREMISE_TABLE } from '@/database/constants'
import { Note as NoteModel } from '../data/note.model'
import { Premise as PremiseModel } from '@/features/premise/data/premise.model'

export async function createNote(database: Database, content: string): Promise<string> {
    let noteId = ''

    await database.write(async () => {
        const created = await database.get<NoteModel>(NOTE_TABLE).create((note: NoteModel) => {
            const now = Date.now()
            note.content = content
            note.createdAt = new Date(now)
            note.updatedAt = new Date(now)
        })

        noteId = created.id
    })

    return noteId
}

export async function promoteNoteToPremise(database: Database, note: NoteModel, content: string): Promise<string> {
    let premiseId = ''

    await database.write(async () => {
        const premise = await database.get<PremiseModel>(PREMISE_TABLE).create((model: PremiseModel) => {
            const now = Date.now()
            model.content = content
            model.status = 'draft'
            model.attitude = null
            model.tagsJson = JSON.stringify([])
            model.bitIdsJson = JSON.stringify([])
            model.sourceNoteId = note.id
            model.createdAt = new Date(now)
            model.updatedAt = new Date(now)
        })

        premiseId = premise.id
        await note.markAsDeleted()
    })

    return premiseId
}
