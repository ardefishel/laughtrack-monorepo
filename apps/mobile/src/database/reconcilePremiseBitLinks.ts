import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, PREMISE_TABLE } from './constants'
import { Bit as BitModel } from './models/bit'
import { Premise as PremiseModel } from './models/premise'

function parseStringArrayJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((entry): entry is string => typeof entry === 'string')
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

export async function reconcilePremiseBitLinks(database: Database): Promise<number> {
    const [bits, premises] = await Promise.all([
        database.get<BitModel>(BIT_TABLE).query().fetch(),
        database.get<PremiseModel>(PREMISE_TABLE).query().fetch(),
    ])

    const premiseIds = new Set(premises.map((premise) => premise.id))
    const nextBitIdsByPremise = new Map<string, string[]>()

    for (const bit of bits) {
        const linkedPremiseId = bit.premiseId
        if (!linkedPremiseId || !premiseIds.has(linkedPremiseId)) continue

        const current = nextBitIdsByPremise.get(linkedPremiseId) ?? []
        current.push(bit.id)
        nextBitIdsByPremise.set(linkedPremiseId, current)
    }

    let updatedCount = 0

    await database.write(async () => {
        for (const premise of premises) {
            const nextBitIds = normalizedIds(nextBitIdsByPremise.get(premise.id) ?? [])
            const currentBitIds = normalizedIds(parseStringArrayJson(premise.bitIdsJson))

            if (areEqualIds(currentBitIds, nextBitIds)) continue

            await premise.update((model) => {
                model.bitIdsJson = JSON.stringify(nextBitIds)
                model.updatedAt = new Date()
            })

            updatedCount += 1
        }
    })

    return updatedCount
}
