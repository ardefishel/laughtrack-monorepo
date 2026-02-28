import { PREMISE_TABLE } from './constants'

export const PREMISE_COLUMNS = {
    content: 'content',
    status: 'status',
    attitude: 'attitude',
    tagsJson: 'tags_json',
    bitIdsJson: 'bit_ids_json',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
} as const

export const PREMISE_TABLE_SCHEMA = {
    name: PREMISE_TABLE,
    columns: [
        { name: PREMISE_COLUMNS.content, type: 'string' as const },
        { name: PREMISE_COLUMNS.status, type: 'string' as const, isIndexed: true },
        { name: PREMISE_COLUMNS.attitude, type: 'string' as const, isOptional: true, isIndexed: true },
        { name: PREMISE_COLUMNS.tagsJson, type: 'string' as const },
        { name: PREMISE_COLUMNS.bitIdsJson, type: 'string' as const },
        { name: PREMISE_COLUMNS.createdAt, type: 'number' as const },
        { name: PREMISE_COLUMNS.updatedAt, type: 'number' as const, isIndexed: true },
    ],
}

export type PremiseRecord = {
    id: string
    content: string
    status: string
    attitude: string | null
    tags_json: string
    bit_ids_json: string
    created_at: number
    updated_at: number
}
