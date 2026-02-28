import { NoteSchema, type Note } from '@/domain/note'
import type { Note as NoteModel } from '../models/note'
import type { NoteRecord } from '../noteSchema'

export const noteRecordToDomain = (record: NoteRecord): Note =>
    NoteSchema.parse({
        id: record.id,
        content: record.content,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
    })

export const noteModelToDomain = (note: NoteModel): Note =>
    NoteSchema.parse({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
    })

export const domainToNoteRecord = (note: Note): NoteRecord => ({
    id: note.id,
    content: note.content,
    created_at: note.createdAt.getTime(),
    updated_at: note.updatedAt.getTime(),
})
