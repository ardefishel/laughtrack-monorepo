import { PREMISE_TABLE } from '@/database/constants'
import { useObservedUpdatedList } from '@/database/hooks/use-observed-updated-list'
import { premiseModelToDomain } from '../data/premise.mapper'
import { Premise as PremiseModel } from '../data/premise.model'
import type { Premise } from '@/types'

export function usePremiseList() {
    const { items, refresh } = useObservedUpdatedList<PremiseModel, Premise>({
        table: PREMISE_TABLE,
        mapModel: premiseModelToDomain,
    })

    return {
        premises: items,
        refresh,
    }
}
