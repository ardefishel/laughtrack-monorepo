import type { Database, Model } from '@nozbe/watermelondb'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useCallback, useEffect, useState } from 'react'

type UseObservedUpdatedListOptions<TModel extends Model, TItem> = {
    table: string
    mapModel: (model: TModel) => TItem
    limit?: number
}

function createUpdatedAtQuery<TModel extends Model>(database: Database, table: string, limit?: number) {
    const collection = database.get<TModel>(table)

    if (typeof limit === 'number') {
        return collection.query(Q.sortBy('updated_at', Q.desc), Q.take(limit))
    }

    return collection.query(Q.sortBy('updated_at', Q.desc))
}

export function useObservedUpdatedList<TModel extends Model, TItem>({
    table,
    mapModel,
    limit,
}: UseObservedUpdatedListOptions<TModel, TItem>) {
    const database = useDatabase()
    const [items, setItems] = useState<TItem[]>([])

    const refresh = useCallback(async () => {
        const records = await createUpdatedAtQuery<TModel>(database, table, limit).fetch()
        setItems(records.map(mapModel))
        return records.length
    }, [database, limit, mapModel, table])

    useEffect(() => {
        const subscription = createUpdatedAtQuery<TModel>(database, table, limit)
            .observe()
            .subscribe((records: TModel[]) => {
                setItems(records.map(mapModel))
            })

        return () => subscription.unsubscribe()
    }, [database, limit, mapModel, table])

    return { items, refresh }
}
