import { SETLIST_TABLE } from './constants'

export const SETLIST_COLUMNS = {
    description: 'description',
    itemsJson: 'items_json',
    tagsJson: 'tags_json',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
} as const

export const SETLIST_TABLE_SCHEMA = {
    name: SETLIST_TABLE,
    columns: [
        { name: SETLIST_COLUMNS.description, type: 'string' as const },
        { name: SETLIST_COLUMNS.itemsJson, type: 'string' as const },
        { name: SETLIST_COLUMNS.tagsJson, type: 'string' as const },
        { name: SETLIST_COLUMNS.createdAt, type: 'number' as const },
        { name: SETLIST_COLUMNS.updatedAt, type: 'number' as const, isIndexed: true },
    ],
}

export type SetlistRecord = {
    id: string
    description: string
    items_json: string
    tags_json: string
    created_at: number
    updated_at: number
}
