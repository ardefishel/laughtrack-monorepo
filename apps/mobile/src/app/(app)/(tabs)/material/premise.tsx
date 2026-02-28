import { PremiseCard } from '@/components/feature/material/premise-card'
import { MaterialListScreen } from '@/components/feature/material/material-list-screen'
import { premiseModelToDomain } from '@/database/mappers/premiseMapper'
import { PREMISE_TABLE } from '@/database/constants'
import { Premise as PremiseModel } from '@/database/models/premise'
import type { Attitude, Premise, PremiseStatus } from '@/types'
import { parseCsvParam } from '@/utils/filter-query'
import { useFocusEffect } from '@react-navigation/native'
import type { FlashListRef } from '@shopify/flash-list'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useMemo, useState } from 'react'

export default function PremiseListScreen() {
    const database = useDatabase()
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; attitudes?: string }>()
    const [search, setSearch] = useState('')
    const [premises, setPremises] = useState<Premise[]>([])
    const listRef = useRef<FlashListRef<Premise> | null>(null)
    const countBeforeCreateRef = useRef<number | null>(null)

    const loadPremises = useCallback(async () => {
        const value = await database
            .get<PremiseModel>(PREMISE_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .fetch()

        const mapped = value.map(premiseModelToDomain)
        setPremises(mapped)
        return mapped
    }, [database])

    useEffect(() => {
        const subscription = database
            .get<PremiseModel>(PREMISE_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .observe()
            .subscribe((value: PremiseModel[]) => {
                setPremises(value.map(premiseModelToDomain))
            })

        return () => subscription.unsubscribe()
    }, [database])

    useFocusEffect(
        useCallback(() => {
            void (async () => {
                const latest = await loadPremises()
                const countBeforeCreate = countBeforeCreateRef.current

                if (countBeforeCreate !== null && latest.length > countBeforeCreate) {
                    requestAnimationFrame(() => {
                        listRef.current?.scrollToOffset({ offset: 0, animated: true })
                    })
                }

                countBeforeCreateRef.current = null
            })()
        }, [loadPremises]),
    )

    const filteredPremises = useMemo(() => {
        let result = premises
        const statuses = parseCsvParam(params.statuses) as PremiseStatus[]
        const tags = parseCsvParam(params.tags)
        const attitudes = parseCsvParam(params.attitudes) as Attitude[]
        const searchTerm = search.trim().toLowerCase()

        if (searchTerm) {
            result = result.filter((p) => p.content.toLowerCase().includes(searchTerm))
        }

        if (statuses.length > 0) {
            result = result.filter((p) => statuses.includes(p.status))
        }
        if (tags.length > 0) {
            result = result.filter((p) => p.tags?.some((t) => tags.includes(t.name)))
        }
        if (attitudes.length > 0) {
            result = result.filter((p) => p.attitude && attitudes.includes(p.attitude))
        }

        return result
    }, [params.statuses, params.tags, params.attitudes, premises, search])

    const hasActiveFilters = !!(params.statuses || params.tags || params.attitudes)

    const openFilter = useCallback(() => {
        router.push({
            pathname: '/premise-filter',
            params: { statuses: params.statuses ?? '', tags: params.tags ?? '', attitudes: params.attitudes ?? '' },
        })
    }, [params.attitudes, params.statuses, params.tags])

    const keyExtractor = useCallback((item: Premise) => item.id, [])

    const handleFabPress = useCallback(() => {
        countBeforeCreateRef.current = premises.length
        router.push('/premise/new')
    }, [premises.length])

    const renderItem = useCallback(({ item }: { item: Premise }) => {
        const handlePress = () => {
            router.push(`/premise/${item.id}`)
        }

        const handleDelete = async () => {
            await database.write(async () => {
                const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(item.id)
                await premise.destroyPermanently()
            })
        }

        return <PremiseCard premise={item} onPress={handlePress} onDelete={handleDelete} />
    }, [database])

    return (
        <MaterialListScreen
            data={filteredPremises}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            hasActiveFilters={hasActiveFilters}
            onFilterPress={openFilter}
            onFabPress={handleFabPress}
            fabLabel='Add Premise'
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder='Search premises'
            listRef={listRef}
        />
    )
}
