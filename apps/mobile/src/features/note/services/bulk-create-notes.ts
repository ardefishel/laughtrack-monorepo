import type { Database } from '@nozbe/watermelondb'
import { NOTE_TABLE } from '@/database/constants'
import { Note as NoteModel } from '@/database/models/note'

export function parseNotesFromText(raw: string): string[] {
    return raw
        .split(/\n\s*\n/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0)
}

export async function bulkCreateNotes(database: Database, contents: string[]): Promise<number> {
    if (contents.length === 0) return 0

    await database.write(async () => {
        const preparedNotes = contents.map((content) =>
            database.get<NoteModel>(NOTE_TABLE).prepareCreate((note: NoteModel) => {
                const now = new Date()
                note.content = content
                note.createdAt = now
                note.updatedAt = now
            })
        )

        await database.batch(...preparedNotes)
    })

    return contents.length
}
