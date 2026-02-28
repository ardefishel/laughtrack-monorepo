import { NOTE_TABLE } from './constants'

export const NOTE_COLUMNS = {
    content: 'content',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
} as const

export const NOTE_TABLE_SCHEMA = {
    name: NOTE_TABLE,
    columns: [
        { name: NOTE_COLUMNS.content, type: 'string' as const },
        { name: NOTE_COLUMNS.createdAt, type: 'number' as const },
        { name: NOTE_COLUMNS.updatedAt, type: 'number' as const, isIndexed: true },
    ],
}

export type NoteRecord = {
    id: string
    content: string
    created_at: number
    updated_at: number
}
