import type { Database } from '@nozbe/watermelondb'
import { Q } from '@nozbe/watermelondb'
import { SETLIST_TABLE } from '@/database/constants'
import { Setlist as SetlistModel } from './setlist.model'
import { setlistModelToDomain } from './setlist.mapper'
import { dbLogger } from '@/lib/loggers'
import type { Setlist } from '@/types'

export function observeAll(database: Database, limit?: number) {
    const collection = database.get<SetlistModel>(SETLIST_TABLE)
    const query = typeof limit === 'number'
        ? collection.query(Q.sortBy('updated_at', Q.desc), Q.take(limit))
        : collection.query(Q.sortBy('updated_at', Q.desc))
    return query.observe()
}

export async function findById(database: Database, id: string): Promise<Setlist | null> {
    try {
        const model = await database.get<SetlistModel>(SETLIST_TABLE).find(id)
        return setlistModelToDomain(model)
    } catch (error) {
        dbLogger.debug('setlist.repository.findById not found', { id, error })
        return null
    }
}
