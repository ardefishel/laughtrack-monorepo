import type { Database } from '@nozbe/watermelondb'
import { reconcileSetlistBitLinks as reconcileSetlistBitLinksPrimitive } from '@/database/sync/reconcile-setlist-bit-links'

export function reconcileSetlistBitLinks(database: Database): Promise<number> {
    return reconcileSetlistBitLinksPrimitive(database)
}
