import { BIT_TABLE } from '@/database/constants'
import { bitModelToDomain } from '@/database/mappers/bitMapper'
import { Bit as BitModel } from '@/database/models/bit'
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
            .subscribe((value: BitModel[]) => {
                setBits(value.map(bitModelToDomain))
            })

        return () => subscription.unsubscribe()
    }, [database])

    return bits
}
