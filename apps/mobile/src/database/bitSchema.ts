import { BIT_TABLE } from './constants'

export const BIT_COLUMNS = {
    content: 'content',
    status: 'status',
    tagsJson: 'tags_json',
    premiseId: 'premise_id',
    setlistIdsJson: 'setlist_ids_json',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
} as const

export const BIT_TABLE_SCHEMA = {
    name: BIT_TABLE,
    columns: [
        { name: BIT_COLUMNS.content, type: 'string' as const },
        { name: BIT_COLUMNS.status, type: 'string' as const, isIndexed: true },
        { name: BIT_COLUMNS.tagsJson, type: 'string' as const },
        { name: BIT_COLUMNS.premiseId, type: 'string' as const, isOptional: true, isIndexed: true },
        { name: BIT_COLUMNS.setlistIdsJson, type: 'string' as const },
        { name: BIT_COLUMNS.createdAt, type: 'number' as const },
        { name: BIT_COLUMNS.updatedAt, type: 'number' as const, isIndexed: true },
    ],
}

export type BitRecord = {
    id: string
    content: string
    status: string
    tags_json: string
    premise_id: string | null
    setlist_ids_json: string
    created_at: number
    updated_at: number
}
