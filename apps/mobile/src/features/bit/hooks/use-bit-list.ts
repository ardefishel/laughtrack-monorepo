import { BIT_TABLE } from '@/database/constants'
import { useObservedUpdatedList } from '@/database/hooks/use-observed-updated-list'
import { bitModelToDomain } from '../data/bit.mapper'
import { Bit as BitModel } from '../data/bit.model'
import type { Bit } from '@/types'

export function useBitList() {
    const { items, refresh } = useObservedUpdatedList<BitModel, Bit>({
        table: BIT_TABLE,
        mapModel: bitModelToDomain,
    })

    return {
        bits: items,
        refresh,
    }
}
