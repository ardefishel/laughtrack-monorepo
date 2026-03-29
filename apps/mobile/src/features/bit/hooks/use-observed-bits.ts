import { BIT_TABLE } from '@/database/constants'
import { bitModelToDomain } from '../data/bit.mapper'
import { useObservedUpdatedList } from '@/database/hooks/use-observed-updated-list'
import { Bit as BitModel } from '../data/bit.model'
import type { Bit } from '@/types'

export function useObservedBits(): Bit[] {
    const { items } = useObservedUpdatedList<BitModel, Bit>({
        table: BIT_TABLE,
        mapModel: bitModelToDomain,
    })
    return items
}
