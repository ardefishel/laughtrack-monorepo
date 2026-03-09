import { BIT_TABLE } from '@/database/constants'
import { bitModelToDomain } from '@/database/mappers/bitMapper'
import { Bit as BitModel } from '@/database/models/bit'
import { dbLogger } from '@/lib/loggers'
import type { Bit } from '@/types'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@nozbe/watermelondb/react'
import { useEffect, useState } from 'react'

export function useObservedBits(): Bit[] {
    const database = useDatabase()
    const [bits, setBits] = useState<Bit[]>([])

    useEffect(() => {
        const subscription = database
            .get<BitModel>(BIT_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .observe()
            .subscribe({
                next: (value: BitModel[]) => {
                    setBits(value.map(bitModelToDomain))
                },
                error: (error: unknown) => {
                    dbLogger.error('useObservedBits subscription failed', error)
                },
            })

        return () => subscription.unsubscribe()
    }, [database])

    return bits
}
