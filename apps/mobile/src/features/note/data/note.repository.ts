import type { Database } from '@nozbe/watermelondb'
import { Q } from '@nozbe/watermelondb'
import { NOTE_TABLE } from '@/database/constants'
import { Note as NoteModel } from './note.model'
import { noteModelToDomain } from './note.mapper'
import { dbLogger } from '@/lib/loggers'
import type { Note } from '@/types'

export function observeAll(database: Database, limit?: number) {
    const collection = database.get<NoteModel>(NOTE_TABLE)
    const query = typeof limit === 'number'
        ? collection.query(Q.sortBy('updated_at', Q.desc), Q.take(limit))
        : collection.query(Q.sortBy('updated_at', Q.desc))
    return query.observe()
}

export async function findById(database: Database, id: string): Promise<Note | null> {
    try {
        const model = await database.get<NoteModel>(NOTE_TABLE).find(id)
        return noteModelToDomain(model)
    } catch (error) {
        dbLogger.debug('note.repository.findById not found', { id, error })
        return null
    }
}
