import { PremiseCard } from '@/features/premise/components/premise-card'
import { MaterialListScreen } from '@/features/material/components/material-list-screen'
import { premiseModelToDomain } from '@/database/mappers/premiseMapper'
import { PREMISE_TABLE } from '@/database/constants'
import { Premise as PremiseModel } from '@/database/models/premise'
import { dbLogger } from '@/lib/loggers'
import type { Attitude, Premise, PremiseStatus } from '@/types'
import { parseCsvParam } from '@/features/material/filters/filter-query'
import { useFocusEffect } from '@react-navigation/native'
import type { FlashListRef } from '@shopify/flash-list'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useMemo, useState } from 'react'

export default function PremiseListScreen() {
    const router = useRouter()
    const database = useDatabase()
    const params = useLocalSearchParams<{ statuses?: string; tags?: string; attitudes?: string }>()
    const [search, setSearch] = useState('')
    const [premises, setPremises] = useState<Premise[]>([])
    const listRef = useRef<FlashListRef<Premise> | null>(null)
    const countBeforeCreateRef = useRef<number | null>(null)

    const fetchPremises = useCallback(async () => {
        try {
            const value = await database
                .get<PremiseModel>(PREMISE_TABLE)
                .query(Q.sortBy('updated_at', Q.desc))
                .fetch()
            setPremises(value.map(premiseModelToDomain))
            return value.length
        } catch (error) {
            dbLogger.error('PremiseList failed to fetch premises', error)
            return 0
        }
    }, [database])

    useEffect(() => {
        const subscription = database
            .get<PremiseModel>(PREMISE_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .observe()
            .subscribe({
                next: (value: PremiseModel[]) => {
                    setPremises(value.map(premiseModelToDomain))
                },
                error: (error: unknown) => {
                    dbLogger.error('PremiseList premises subscription failed', error)
                },
            })

        return () => subscription.unsubscribe()
    }, [database])

    useFocusEffect(
        useCallback(() => {
            void (async () => {
                const count = await fetchPremises()
                const countBeforeCreate = countBeforeCreateRef.current

                if (countBeforeCreate !== null && count > countBeforeCreate) {
                    requestAnimationFrame(() => {
                        listRef.current?.scrollToOffset({ offset: 0, animated: true })
                    })
                }

                countBeforeCreateRef.current = null
            })()
        }, [fetchPremises]),
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
    }, [params.attitudes, params.statuses, params.tags, router])

    const keyExtractor = useCallback((item: Premise) => item.id, [])

    const handleFabPress = useCallback(() => {
        countBeforeCreateRef.current = premises.length
        router.push('/premise/new')
    }, [premises.length, router])

    const renderItem = useCallback(({ item }: { item: Premise }) => {
        const handlePress = () => {
            router.push(`/premise/${item.id}`)
        }

        const handleDelete = async () => {
            try {
                await database.write(async () => {
                    const premise = await database.get<PremiseModel>(PREMISE_TABLE).find(item.id)
                    await premise.destroyPermanently()
                })
            } catch (error) {
                dbLogger.error('PremiseList failed to delete premise', { error, premiseId: item.id })
            }
        }

        return <PremiseCard premise={item} onPress={handlePress} onDelete={handleDelete} />
    }, [database, router])

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
