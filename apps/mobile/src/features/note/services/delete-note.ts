import type { Database } from '@nozbe/watermelondb'
import { NOTE_TABLE } from '@/database/constants'
import { Note as NoteModel } from '@/database/models/note'

export async function deleteNote(database: Database, noteId: string) {
    await database.write(async () => {
        const note = await database.get<NoteModel>(NOTE_TABLE).find(noteId)
        await note.destroyPermanently()
    })
}
