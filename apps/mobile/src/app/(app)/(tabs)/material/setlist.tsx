import { SetlistCard } from '@/components/feature/material/setlist-card'
import { MaterialListScreen } from '@/components/feature/material/material-list-screen'
import { setlistModelToDomain } from '@/database/mappers/setlistMapper'
import { SETLIST_TABLE } from '@/database/constants'
import { Setlist as SetlistModel } from '@/database/models/setlist'
import type { Setlist } from '@/types'
import { parseCsvParam } from '@/utils/filter-query'
import { useFocusEffect } from '@react-navigation/native'
import type { FlashListRef } from '@shopify/flash-list'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function SetlistListScreen() {
    const database = useDatabase()
    const params = useLocalSearchParams<{ tags?: string }>()
    const [search, setSearch] = useState('')
    const [setlists, setSetlists] = useState<Setlist[]>([])
    const listRef = useRef<FlashListRef<Setlist> | null>(null)
    const countBeforeCreateRef = useRef<number | null>(null)

    const loadSetlists = useCallback(async () => {
        const value = await database
            .get<SetlistModel>(SETLIST_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .fetch()

        const mapped = value.map(setlistModelToDomain)
        setSetlists(mapped)
        return mapped
    }, [database])

    useEffect(() => {
        const subscription = database
            .get<SetlistModel>(SETLIST_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .observe()
            .subscribe((value: SetlistModel[]) => {
                setSetlists(value.map(setlistModelToDomain))
            })

        return () => subscription.unsubscribe()
    }, [database])

    useFocusEffect(
        useCallback(() => {
            void (async () => {
                const latest = await loadSetlists()
                const countBeforeCreate = countBeforeCreateRef.current

                if (countBeforeCreate !== null && latest.length > countBeforeCreate) {
                    requestAnimationFrame(() => {
                        listRef.current?.scrollToOffset({ offset: 0, animated: true })
                    })
                }

                countBeforeCreateRef.current = null
            })()
        }, [loadSetlists]),
    )

    const filteredSetlists = useMemo(() => {
        let result = setlists
        const tags = parseCsvParam(params.tags)
        const searchTerm = search.trim().toLowerCase()

        if (searchTerm) {
            result = result.filter((s) => s.description.toLowerCase().includes(searchTerm))
        }

        if (tags.length > 0) {
            result = result.filter((s) => s.tags?.some((t) => tags.includes(t.name)))
        }
        return result
    }, [params.tags, search, setlists])

    const hasActiveFilters = !!params.tags

    const openFilter = useCallback(() => {
        router.push({
            pathname: '/setlist-filter',
            params: { tags: params.tags ?? '' },
        })
    }, [params.tags])

    const keyExtractor = useCallback((item: Setlist) => item.id, [])

    const handleFabPress = useCallback(() => {
        countBeforeCreateRef.current = setlists.length
        router.push('/setlist/new')
    }, [setlists.length])

    const renderItem = useCallback(({ item }: { item: Setlist }) => {
        const handlePress = () => {
            router.push(`/setlist/${item.id}`)
        }

        const handleDelete = () => {
            void database.write(async () => {
                const setlist = await database.get<SetlistModel>(SETLIST_TABLE).find(item.id)
                await setlist.destroyPermanently()
            })
        }

        return <SetlistCard setlist={item} onPress={handlePress} onDelete={handleDelete} />
    }, [database])

    return (
        <MaterialListScreen
            data={filteredSetlists}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            hasActiveFilters={hasActiveFilters}
            onFilterPress={openFilter}
            onFabPress={handleFabPress}
            fabLabel='Add Setlist'
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder='Search setlists'
            listRef={listRef}
        />
    )
}
