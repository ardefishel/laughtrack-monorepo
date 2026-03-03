import type { Database } from '@nozbe/watermelondb'
import { syncBitPremiseRelation as syncBitPremiseRelationPrimitive } from '@/database/bit-premise-sync'
import { reconcilePremiseBitLinks as reconcilePremiseBitLinksPrimitive } from '@/database/reconcilePremiseBitLinks'

type SyncBitPremiseRelationInput = Parameters<typeof syncBitPremiseRelationPrimitive>[0]

export function syncBitPremiseRelation(input: SyncBitPremiseRelationInput) {
    return syncBitPremiseRelationPrimitive(input)
}

export function reconcilePremiseBitLinks(database: Database): Promise<number> {
    return reconcilePremiseBitLinksPrimitive(database)
}
