import type { Database } from '@nozbe/watermelondb'
import { Q } from '@nozbe/watermelondb'
import { PREMISE_TABLE } from '@/database/constants'
import { Premise as PremiseModel } from './premise.model'
import { premiseModelToDomain } from './premise.mapper'
import { dbLogger } from '@/lib/loggers'
import type { Premise } from '@/types'

export function observeAll(database: Database, limit?: number) {
    const collection = database.get<PremiseModel>(PREMISE_TABLE)
    const query = typeof limit === 'number'
        ? collection.query(Q.sortBy('updated_at', Q.desc), Q.take(limit))
        : collection.query(Q.sortBy('updated_at', Q.desc))
    return query.observe()
}

export async function findById(database: Database, id: string): Promise<Premise | null> {
    try {
        const model = await database.get<PremiseModel>(PREMISE_TABLE).find(id)
        return premiseModelToDomain(model)
    } catch (error) {
        dbLogger.debug('premise.repository.findById not found', { id, error })
        return null
    }
}
