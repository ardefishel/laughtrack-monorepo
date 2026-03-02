import { PremiseSchema, type Attitude, type Premise, type PremiseStatus } from '@/domain/premise'
import type { Premise as PremiseModel } from '../models/premise'
import type { PremiseRecord } from '../premiseSchema'

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

type PremiseTag = NonNullable<Premise['tags']>[number]

function tagNamesToTags(tagNames: string[], createdAt: Date, updatedAt: Date): PremiseTag[] {
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
    attitude: string | null
    tagsJson: string
    bitIdsJson: string
    sourceNoteId: string | null
    createdAt: Date
    updatedAt: Date
}): Premise {
    const tagNames = parseStringArrayJson(input.tagsJson)
    const bitIds = parseStringArrayJson(input.bitIdsJson)

    return PremiseSchema.parse({
        id: input.id,
        content: input.content,
        status: input.status as PremiseStatus,
        attitude: (input.attitude ?? undefined) as Attitude | undefined,
        tags: tagNamesToTags(tagNames, input.createdAt, input.updatedAt),
        bitIds,
        sourceNoteId: input.sourceNoteId ?? undefined,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    })
}

export const premiseRecordToDomain = (record: PremiseRecord): Premise =>
    toDomain({
        id: record.id,
        content: record.content,
        status: record.status,
        attitude: record.attitude,
        tagsJson: record.tags_json,
        bitIdsJson: record.bit_ids_json,
        sourceNoteId: record.source_note_id,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
    })

export const premiseModelToDomain = (premise: PremiseModel): Premise =>
    toDomain({
        id: premise.id,
        content: premise.content,
        status: premise.status,
        attitude: premise.attitude,
        tagsJson: premise.tagsJson,
        bitIdsJson: premise.bitIdsJson,
        sourceNoteId: premise.sourceNoteId,
        createdAt: premise.createdAt,
        updatedAt: premise.updatedAt,
    })

export const domainToPremiseRecord = (premise: Premise): PremiseRecord => ({
    id: premise.id,
    content: premise.content,
    status: premise.status,
    attitude: premise.attitude ?? null,
    tags_json: JSON.stringify((premise.tags ?? []).map((tag) => tag.name)),
    bit_ids_json: JSON.stringify(premise.bitIds ?? []),
    source_note_id: premise.sourceNoteId ?? null,
    created_at: premise.createdAt.getTime(),
    updated_at: premise.updatedAt.getTime(),
})

export const parsePremiseTagNames = parseStringArrayJson
