import type { Database } from '@nozbe/watermelondb'
import { reconcileSetlistBitLinks as reconcileSetlistBitLinksPrimitive } from '@/database/sync/reconcileSetlistBitLinks'

export function reconcileSetlistBitLinks(database: Database): Promise<number> {
    return reconcileSetlistBitLinksPrimitive(database)
}
