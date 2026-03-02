import { BitSchema, type Bit, type BitStatus } from '@/domain/bit'
import type { Bit as BitModel } from '../models/bit'
import type { BitRecord } from '../bitSchema'

const HTML_ENTITY_MAP: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
}

function parseStringArrayJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((entry): entry is string => typeof entry === 'string')
    } catch {
        return []
    }
}

function toTagId(name: string): string {
    return `tag-${name.toLowerCase().replace(/\s+/g, '-')}`
}

type BitTag = NonNullable<Bit['tags']>[number]

function tagNamesToTags(tagNames: string[], createdAt: Date, updatedAt: Date): BitTag[] {
    return tagNames.map((name) => ({
        id: toTagId(name),
        name,
        createdAt,
        updatedAt,
    }))
}

function toDomain(input: {
    id: string
    content: string
    status: string
    tagsJson: string
    premiseId: string | null
    setlistIdsJson: string
    createdAt: Date
    updatedAt: Date
}): Bit {
    const tags = parseStringArrayJson(input.tagsJson)
    const setlistIds = parseStringArrayJson(input.setlistIdsJson)

    return BitSchema.parse({
        id: input.id,
        content: input.content,
        status: input.status as BitStatus,
        tags: tagNamesToTags(tags, input.createdAt, input.updatedAt),
        premiseId: input.premiseId ?? undefined,
        setlistIds,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    })
}

export const bitRecordToDomain = (record: BitRecord): Bit =>
    toDomain({
        id: record.id,
        content: record.content,
        status: record.status,
        tagsJson: record.tags_json,
        premiseId: record.premise_id,
        setlistIdsJson: record.setlist_ids_json,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
    })

export const bitModelToDomain = (bit: BitModel): Bit =>
    toDomain({
        id: bit.id,
        content: bit.content,
        status: bit.status,
        tagsJson: bit.tagsJson,
        premiseId: bit.premiseId,
        setlistIdsJson: bit.setlistIdsJson,
        createdAt: bit.createdAt,
        updatedAt: bit.updatedAt,
    })

export const domainToBitRecord = (bit: Bit): BitRecord => ({
    id: bit.id,
    content: bit.content,
    status: bit.status,
    tags_json: JSON.stringify((bit.tags ?? []).map((tag) => tag.name)),
    premise_id: bit.premiseId ?? null,
    setlist_ids_json: JSON.stringify(bit.setlistIds ?? []),
    created_at: bit.createdAt.getTime(),
    updated_at: bit.updatedAt.getTime(),
})

export const parseBitTagNames = parseStringArrayJson

function decodeHtmlEntities(value: string): string {
    return value.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => HTML_ENTITY_MAP[match] ?? match)
}

function stripHtmlToLines(content: string): string[] {
    const withBreaks = content
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<\s*\/\s*p\s*>/gi, '\n')
        .replace(/<\s*\/\s*div\s*>/gi, '\n')
        .replace(/<\s*\/\s*li\s*>/gi, '\n')

    const withoutTags = withBreaks.replace(/<[^>]+>/g, ' ')
    const decoded = decodeHtmlEntities(withoutTags)

    return decoded
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
}

export function bitContentToPreview(content: string): { title: string; description: string } {
    const lines = stripHtmlToLines(content)
    const title = lines[0] ?? ''
    const description = lines[1] ?? ''

    return { title, description }
}
