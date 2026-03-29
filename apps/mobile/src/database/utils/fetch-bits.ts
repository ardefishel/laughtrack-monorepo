import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE } from '@/database/constants'
import { bitModelToDomain } from '@/features/bit/data/bit.mapper'
import { Bit as BitModel } from '@/features/bit/data/bit.model'
import { dbLogger } from '@/lib/loggers'
import type { Bit } from '@/types'

export async function fetchBitsByIds(database: Database, ids: string[]): Promise<Map<string, Bit>> {
    const foundModels = await Promise.all(
        ids.map(async (bitId) => {
            try {
                return await database.get<BitModel>(BIT_TABLE).find(bitId)
            } catch (error) {
                dbLogger.debug('fetchBitsByIds missing bit', { bitId, error })
                return null
            }
        }),
    )

    return new Map(
        foundModels
            .filter((model): model is BitModel => model !== null)
            .map((model) => [model.id, bitModelToDomain(model)]),
    )
}
