import { SetlistSchema, type Setlist, type SetlistItem, type SetlistNote } from '@/domain/setlist'
import type { Setlist as SetlistModel } from '../models/setlist'
import type { SetlistRecord } from '../setlistSchema'

function parseSetlistTagNamesJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []

        return parsed
            .map((entry) => {
                if (typeof entry === 'string') return entry
                if (
                    entry &&
                    typeof entry === 'object' &&
                    'name' in entry &&
                    typeof entry.name === 'string'
                ) {
                    return entry.name
                }
                return null
            })
            .filter((entry): entry is string => typeof entry === 'string')
    } catch {
        return []
    }
}

function toTagId(name: string): string {
    return `tag-${name.toLowerCase().replace(/\s+/g, '-')}`
}

type SetlistTag = NonNullable<Setlist['tags']>[number]

function tagNamesToTags(tagNames: string[], createdAt: Date, updatedAt: Date): SetlistTag[] {
    return tagNames.map((name) => ({
        id: toTagId(name),
        name,
        createdAt,
        updatedAt,
    }))
}

function toValidDate(value: unknown, fallback: Date): Date {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) {
            return parsed
        }
    }

    return fallback
}

function parseSetlistItemsJson(value: string, fallbackCreatedAt: Date, fallbackUpdatedAt: Date): SetlistItem[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []

        return parsed
            .map((entry): SetlistItem | null => {
                if (!entry || typeof entry !== 'object') return null

                if (!('id' in entry) || !('type' in entry)) return null
                if (typeof entry.id !== 'string' || typeof entry.type !== 'string') return null

                if (entry.type === 'bit') {
                    if (!('bitId' in entry) || typeof entry.bitId !== 'string') return null

                    return {
                        id: entry.id,
                        type: 'bit',
                        bitId: entry.bitId,
                    }
                }

                if (entry.type === 'set-note') {
                    if (!('setlistNote' in entry)) return null
                    const setlistNoteRaw = entry.setlistNote
                    if (!setlistNoteRaw || typeof setlistNoteRaw !== 'object') return null
                    if (
                        !('id' in setlistNoteRaw) ||
                        !('content' in setlistNoteRaw) ||
                        typeof setlistNoteRaw.id !== 'string' ||
                        typeof setlistNoteRaw.content !== 'string'
                    ) {
                        return null
                    }

                    const setlistNote: SetlistNote = {
                        id: setlistNoteRaw.id,
                        content: setlistNoteRaw.content,
                        createdAt: toValidDate(
                            'createdAt' in setlistNoteRaw ? setlistNoteRaw.createdAt : undefined,
                            fallbackCreatedAt,
                        ),
                        updatedAt: toValidDate(
                            'updatedAt' in setlistNoteRaw ? setlistNoteRaw.updatedAt : undefined,
                            fallbackUpdatedAt,
                        ),
                    }

                    return {
                        id: entry.id,
                        type: 'set-note',
                        setlistNote,
                    }
                }

                return null
            })
            .filter((entry): entry is SetlistItem => entry !== null)
    } catch {
        return []
    }
}

function toDomain(input: {
    id: string
    description: string
    itemsJson: string
    tagsJson: string
    createdAt: Date
    updatedAt: Date
}): Setlist {
    const tagNames = parseSetlistTagNamesJson(input.tagsJson)
    const items = parseSetlistItemsJson(input.itemsJson, input.createdAt, input.updatedAt)

    return SetlistSchema.parse({
        id: input.id,
        description: input.description,
        items,
        tags: tagNamesToTags(tagNames, input.createdAt, input.updatedAt),
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    })
}

export const setlistRecordToDomain = (record: SetlistRecord): Setlist =>
    toDomain({
        id: record.id,
        description: record.description,
        itemsJson: record.items_json,
        tagsJson: record.tags_json,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
    })

export const setlistModelToDomain = (setlist: SetlistModel): Setlist =>
    toDomain({
        id: setlist.id,
        description: setlist.description,
        itemsJson: setlist.itemsJson,
        tagsJson: setlist.tagsJson,
        createdAt: setlist.createdAt,
        updatedAt: setlist.updatedAt,
    })

export const domainToSetlistRecord = (setlist: Setlist): SetlistRecord => ({
    id: setlist.id,
    description: setlist.description,
    items_json: JSON.stringify(setlist.items ?? []),
    tags_json: JSON.stringify((setlist.tags ?? []).map((tag) => tag.name)),
    created_at: setlist.createdAt.getTime(),
    updated_at: setlist.updatedAt.getTime(),
})

export const parseSetlistTagNames = parseSetlistTagNamesJson
