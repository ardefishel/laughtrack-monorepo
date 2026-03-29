import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, SETLIST_TABLE } from '@/database/constants'
import { setlistModelToDomain } from '../data/setlist.mapper'
import { Bit as BitModel } from '@/features/bit/data/bit.model'
import { Setlist as SetlistModel } from '../data/setlist.model'
import { parseStringArrayJson } from '@/database/utils/json'
import { dbLogger } from '@/lib/loggers'

function uniqueSortedIds(values: string[]): string[] {
    return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

export async function deleteSetlist(database: Database, setlistId: string) {
    await database.write(async () => {
        const now = new Date()
        const setlist = await database.get<SetlistModel>(SETLIST_TABLE).find(setlistId)
        const domainSetlist = setlistModelToDomain(setlist)
        const bitIds = uniqueSortedIds(
            domainSetlist.items
                .filter((item): item is Extract<typeof domainSetlist.items[number], { type: 'bit' }> => item.type === 'bit')
                .map((item) => item.bitId),
        )

        for (const bitId of bitIds) {
            try {
                const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)
                const currentSetlistIds = uniqueSortedIds(parseStringArrayJson(bit.setlistIdsJson))
                const nextSetlistIds = currentSetlistIds.filter((value) => value !== setlistId)

                if (
                    nextSetlistIds.length === currentSetlistIds.length &&
                    nextSetlistIds.every((value, index) => value === currentSetlistIds[index])
                ) {
                    continue
                }

                await bit.update((model) => {
                    model.setlistIdsJson = JSON.stringify(nextSetlistIds)
                    model.updatedAt = now
                })
            } catch (error) {
                dbLogger.debug('deleteSetlist ignored failed bit relation cleanup', {
                    setlistId,
                    bitId,
                    error,
                })
            }
        }

        await setlist.destroyPermanently()
    })
}
