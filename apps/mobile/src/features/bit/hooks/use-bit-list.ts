import { BIT_TABLE } from '@/database/constants'
import { useObservedUpdatedList } from '@/database/hooks/use-observed-updated-list'
import { bitModelToDomain } from '@/database/mappers/bitMapper'
import { Bit as BitModel } from '@/database/models/bit'
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
