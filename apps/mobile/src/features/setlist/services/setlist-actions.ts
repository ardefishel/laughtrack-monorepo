import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, SETLIST_TABLE } from '@/database/constants'
import { setlistModelToDomain } from '@/database/mappers/setlistMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { Setlist as SetlistModel } from '@/database/models/setlist'
import { normalizedIds, areEqualIds } from '@/database/utils/ids'
import { parseStringArrayJson } from '@/database/utils/json'
import { dbLogger } from '@/lib/loggers'
import type { SetlistItem } from '@/types'

function toPersistedSetlistItems(items: SetlistItem[]): SetlistItem[] {
    return items
        .map((item): SetlistItem | null => {
            if (item.type === 'bit') {
                return {
                    id: item.id,
                    type: 'bit',
                    bitId: item.bitId,
                }
            }

            if (!item.setlistNote) return null

            return {
                id: item.id,
                type: 'set-note',
                setlistNote: {
                    id: item.setlistNote.id,
                    content: item.setlistNote.content,
                    createdAt: item.setlistNote.createdAt,
                    updatedAt: item.setlistNote.updatedAt,
                },
            }
        })
        .filter((item): item is SetlistItem => item !== null)
}

export function extractBitIds(items: SetlistItem[]): string[] {
    return normalizedIds(
        items
            .filter((item): item is Extract<SetlistItem, { type: 'bit' }> => item.type === 'bit')
            .map((item) => item.bitId),
    )
}

async function syncBitSetlistLink(
    database: Database,
    bitId: string,
    setlistId: string,
    shouldContain: boolean,
    now: Date,
): Promise<void> {
    try {
        const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)
        const currentSetlistIds = normalizedIds(parseStringArrayJson(bit.setlistIdsJson))

        const nextSetlistIds = shouldContain
            ? normalizedIds([...currentSetlistIds, setlistId])
            : currentSetlistIds.filter((id) => id !== setlistId)

        if (areEqualIds(nextSetlistIds, currentSetlistIds)) return

        await bit.update((model) => {
            model.setlistIdsJson = JSON.stringify(nextSetlistIds)
            model.updatedAt = now
        })
    } catch (error) {
        dbLogger.warn('syncBitSetlistLink ignored failed bit update', { bitId, setlistId, error })
    }
}

export interface SaveSetlistParams {
    description: string
    tags: string[]
    items: SetlistItem[]
    existingSetlist?: { id: string; model: SetlistModel } | null
}

export async function saveSetlist(database: Database, params: SaveSetlistParams): Promise<void> {
    const { description, tags, items, existingSetlist } = params
    const persistedItems = toPersistedSetlistItems(items)
    const nextBitIds = extractBitIds(persistedItems)

    await database.write(async () => {
        const now = new Date()

        if (existingSetlist) {
            const { id: setlistId, model: setlistModel } = existingSetlist
            const previousBitIds = extractBitIds(setlistModelToDomain(setlistModel).items)

            await setlistModel.update((setlist) => {
                setlist.description = description
                setlist.tagsJson = JSON.stringify(tags)
                setlist.itemsJson = JSON.stringify(persistedItems)
                setlist.updatedAt = now
            })

            const touchedBitIds = normalizedIds([...nextBitIds, ...previousBitIds])
            const nextBitIdSet = new Set(nextBitIds)

            for (const bitId of touchedBitIds) {
                await syncBitSetlistLink(database, bitId, setlistId, nextBitIdSet.has(bitId), now)
            }

            return
        }

        const createdSetlist = await database.get<SetlistModel>(SETLIST_TABLE).create((setlist: SetlistModel) => {
            setlist.description = description
            setlist.tagsJson = JSON.stringify(tags)
            setlist.itemsJson = JSON.stringify(persistedItems)
            setlist.createdAt = now
            setlist.updatedAt = now
        })

        for (const bitId of nextBitIds) {
            await syncBitSetlistLink(database, bitId, createdSetlist.id, true, now)
        }
    })
}
