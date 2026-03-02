import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, SETLIST_TABLE } from './constants'
import { Bit as BitModel } from './models/bit'
import { Setlist as SetlistModel } from './models/setlist'

function parseStringArrayJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((entry): entry is string => typeof entry === 'string')
    } catch {
        return []
    }
}

function parseSetlistBitIds(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []

        return parsed
            .filter(
                (entry): entry is { type: 'bit'; bitId: string } =>
                    typeof entry === 'object' &&
                    entry !== null &&
                    'type' in entry &&
                    entry.type === 'bit' &&
                    'bitId' in entry &&
                    typeof entry.bitId === 'string'
            )
            .map((entry) => entry.bitId)
    } catch {
        return []
    }
}

function normalizedIds(value: string[]): string[] {
    return [...new Set(value)].sort((a, b) => a.localeCompare(b))
}

function areEqualIds(left: string[], right: string[]): boolean {
    if (left.length !== right.length) return false
    return left.every((value, index) => value === right[index])
}

export async function reconcileSetlistBitLinks(database: Database): Promise<number> {
    const [bits, setlists] = await Promise.all([
        database.get<BitModel>(BIT_TABLE).query().fetch(),
        database.get<SetlistModel>(SETLIST_TABLE).query().fetch(),
    ])

    const nextSetlistIdsByBit = new Map<string, string[]>()

    for (const setlist of setlists) {
        const linkedBitIds = normalizedIds(parseSetlistBitIds(setlist.itemsJson))

        for (const bitId of linkedBitIds) {
            const current = nextSetlistIdsByBit.get(bitId) ?? []
            current.push(setlist.id)
            nextSetlistIdsByBit.set(bitId, current)
        }
    }

    let updatedCount = 0

    await database.write(async () => {
        for (const bit of bits) {
            const nextSetlistIds = normalizedIds(nextSetlistIdsByBit.get(bit.id) ?? [])
            const currentSetlistIds = normalizedIds(parseStringArrayJson(bit.setlistIdsJson))

            if (areEqualIds(currentSetlistIds, nextSetlistIds)) continue

            await bit.update((model) => {
                model.setlistIdsJson = JSON.stringify(nextSetlistIds)
                model.updatedAt = new Date()
            })

            updatedCount += 1
        }
    })

    return updatedCount
}
