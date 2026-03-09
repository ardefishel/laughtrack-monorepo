import { useEffect, useRef, useState } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { PREMISE_TABLE, BIT_TABLE, SETLIST_TABLE } from '@/database/constants'
import { Premise } from '@/database/models/premise'
import { Bit } from '@/database/models/bit'
import { Setlist } from '@/database/models/setlist'
import { stripHtmlToLines } from '@/database/utils/html'
import type { RecentWork } from '@/domain/recent-work'
import { dbLogger } from '@/lib/loggers'

const MAX_RECENT_WORKS = 5

function mergeAndSort(
    premises: RecentWork[],
    bits: RecentWork[],
    setlists: RecentWork[],
): RecentWork[] {
    return [...premises, ...bits, ...setlists]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, MAX_RECENT_WORKS)
}

export function useRecentWorks() {
    const database = useDatabase()
    const [recentWorks, setRecentWorks] = useState<RecentWork[]>([])

    const latestPremises = useRef<RecentWork[]>([])
    const latestBits = useRef<RecentWork[]>([])
    const latestSetlists = useRef<RecentWork[]>([])

    useEffect(() => {
        const recentQuery = [Q.sortBy('updated_at', Q.desc), Q.take(MAX_RECENT_WORKS)] as const

        const premiseSub = database
            .get<Premise>(PREMISE_TABLE)
            .query(...recentQuery)
            .observe()
            .subscribe({
                next: (items) => {
                    latestPremises.current = items.map((p) => ({
                        id: p.id,
                        type: 'premise' as const,
                        title: p.content,
                        updatedAt: p.updatedAt,
                    }))
                    setRecentWorks(mergeAndSort(latestPremises.current, latestBits.current, latestSetlists.current))
                },
                error: (error: unknown) => {
                    dbLogger.error('Recent premises subscription failed', error)
                },
            })

        const bitSub = database
            .get<Bit>(BIT_TABLE)
            .query(...recentQuery)
            .observe()
            .subscribe({
                next: (items) => {
                    latestBits.current = items.map((b) => ({
                        id: b.id,
                        type: 'bit' as const,
                        title: stripHtmlToLines(b.content).join(' '),
                        updatedAt: b.updatedAt,
                    }))
                    setRecentWorks(mergeAndSort(latestPremises.current, latestBits.current, latestSetlists.current))
                },
                error: (error: unknown) => {
                    dbLogger.error('Recent bits subscription failed', error)
                },
            })

        const setlistSub = database
            .get<Setlist>(SETLIST_TABLE)
            .query(...recentQuery)
            .observe()
            .subscribe({
                next: (items) => {
                    latestSetlists.current = items.map((s) => ({
                        id: s.id,
                        type: 'set' as const,
                        title: s.description,
                        updatedAt: s.updatedAt,
                    }))
                    setRecentWorks(mergeAndSort(latestPremises.current, latestBits.current, latestSetlists.current))
                },
                error: (error: unknown) => {
                    dbLogger.error('Recent setlists subscription failed', error)
                },
            })

        return () => {
            premiseSub.unsubscribe()
            bitSub.unsubscribe()
            setlistSub.unsubscribe()
        }
    }, [database])

    return recentWorks
}
