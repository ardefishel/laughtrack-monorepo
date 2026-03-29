import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, PREMISE_TABLE, SETLIST_TABLE } from '@/database/constants'
import { setlistModelToDomain } from '@/features/setlist/data/setlist.mapper'
import { Bit as BitModel } from '../data/bit.model'
import { Premise as PremiseModel } from '@/features/premise/data/premise.model'
import { Setlist as SetlistModel } from '@/features/setlist/data/setlist.model'
import { parseStringArrayJson } from '@/database/utils/json'
import { dbLogger } from '@/lib/loggers'

export async function deleteBit(database: Database, bitId: string) {
    await database.write(async () => {
        const now = new Date()
        const bit = await database.get<BitModel>(BIT_TABLE).find(bitId)

        if (bit.premiseId) {
            try {
                const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(bit.premiseId)
                const nextBitIds = parseStringArrayJson(premise.bitIdsJson).filter((value) => value !== bit.id)

                await premise.update((model) => {
                    model.bitIdsJson = JSON.stringify(nextBitIds)
                    model.updatedAt = now
                })
            } catch (error) {
                dbLogger.debug('deleteBit ignored dangling premise relation', {
                    bitId: bit.id,
                    premiseId: bit.premiseId,
                    error,
                })
            }
        }

        const setlists = await database.get<SetlistModel>(SETLIST_TABLE).query().fetch()

        for (const setlist of setlists) {
            const domainSetlist = setlistModelToDomain(setlist)
            const nextItems = domainSetlist.items.filter((item) => item.type !== 'bit' || item.bitId !== bit.id)

            if (nextItems.length === domainSetlist.items.length) {
                continue
            }

            await setlist.update((model) => {
                model.itemsJson = JSON.stringify(nextItems)
                model.updatedAt = now
            })
        }

        await bit.destroyPermanently()
    })
}
