import type { Database } from '@nozbe/watermelondb'
import { Q } from '@nozbe/watermelondb'
import { BIT_TABLE } from '@/database/constants'
import { Bit as BitModel } from './bit.model'
import { bitModelToDomain } from './bit.mapper'
import { dbLogger } from '@/lib/loggers'
import type { Bit } from '@/types'

export function observeAll(database: Database, limit?: number) {
    const collection = database.get<BitModel>(BIT_TABLE)
    const query = typeof limit === 'number'
        ? collection.query(Q.sortBy('updated_at', Q.desc), Q.take(limit))
        : collection.query(Q.sortBy('updated_at', Q.desc))
    return query.observe()
}

export async function findById(database: Database, id: string): Promise<Bit | null> {
    try {
        const model = await database.get<BitModel>(BIT_TABLE).find(id)
        return bitModelToDomain(model)
    } catch (error) {
        dbLogger.debug('bit.repository.findById not found', { id, error })
        return null
    }
}

export async function findByIds(database: Database, ids: string[]): Promise<Map<string, Bit>> {
    const foundModels = await Promise.all(
        ids.map(async (bitId) => {
            try {
                return await database.get<BitModel>(BIT_TABLE).find(bitId)
            } catch (error) {
                dbLogger.debug('bit.repository.findByIds missing bit', { bitId, error })
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
