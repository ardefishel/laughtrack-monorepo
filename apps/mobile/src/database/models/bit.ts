import { Model } from '@nozbe/watermelondb'
import { date, field, writer } from '@nozbe/watermelondb/decorators'
import type { BitStatus } from '@/domain/bit'
import { BIT_TABLE } from '../constants'
import { BIT_COLUMNS } from '../bitSchema'

type BitUpdateInput = {
    content: string
    status: BitStatus
    tags: string[]
    premiseId: string | null
}

export class Bit extends Model {
    static table = BIT_TABLE

    @field(BIT_COLUMNS.content) content!: string
    @field(BIT_COLUMNS.status) status!: BitStatus
    @field(BIT_COLUMNS.tagsJson) tagsJson!: string
    @field(BIT_COLUMNS.premiseId) premiseId!: string | null
    @field(BIT_COLUMNS.setlistIdsJson) setlistIdsJson!: string
    @date(BIT_COLUMNS.createdAt) createdAt!: Date
    @date(BIT_COLUMNS.updatedAt) updatedAt!: Date

    @writer async updateBit(input: BitUpdateInput) {
        await this.update((bit) => {
            bit.content = input.content
            bit.status = input.status
            bit.tagsJson = JSON.stringify(input.tags)
            bit.premiseId = input.premiseId
            bit.updatedAt = new Date()
        })
    }
}
