import { SETLIST_TABLE } from '@/database/constants'
import { useObservedUpdatedList } from '@/database/hooks/use-observed-updated-list'
import { setlistModelToDomain } from '@/database/mappers/setlistMapper'
import { Setlist as SetlistModel } from '@/database/models/setlist'
import type { Setlist } from '@/types'

export function useSetlistList() {
    const { items, refresh } = useObservedUpdatedList<SetlistModel, Setlist>({
        table: SETLIST_TABLE,
        mapModel: setlistModelToDomain,
    })

    return {
        setlists: items,
        refresh,
    }
}
