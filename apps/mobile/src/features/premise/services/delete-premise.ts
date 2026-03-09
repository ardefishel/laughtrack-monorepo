import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, PREMISE_TABLE } from '@/database/constants'
import { Bit as BitModel } from '@/database/models/bit'
import { Premise as PremiseModel } from '@/database/models/premise'

export async function deletePremise(database: Database, premiseId: string) {
    await database.write(async () => {
        const now = new Date()
        const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(premiseId)
        const linkedBits = await database.get<BitModel>(BIT_TABLE).query().fetch()

        for (const bit of linkedBits) {
            if (bit.premiseId !== premiseId) continue

            await bit.update((model) => {
                model.premiseId = null
                model.updatedAt = now
            })
        }

        await premise.destroyPermanently()
    })
}
