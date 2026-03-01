import { Model } from '@nozbe/watermelondb'
import { date, field, writer } from '@nozbe/watermelondb/decorators'
import type { Attitude, PremiseStatus } from '@/types'
import { PREMISE_TABLE } from '../constants'
import { PREMISE_COLUMNS } from '../premiseSchema'

type PremiseUpdateInput = {
    content: string
    status: PremiseStatus
    attitude?: Attitude
    tags: string[]
}

export class Premise extends Model {
    static table = PREMISE_TABLE

    @field(PREMISE_COLUMNS.content) content!: string
    @field(PREMISE_COLUMNS.status) status!: PremiseStatus
    @field(PREMISE_COLUMNS.attitude) attitude!: Attitude | null
    @field(PREMISE_COLUMNS.tagsJson) tagsJson!: string
    @field(PREMISE_COLUMNS.bitIdsJson) bitIdsJson!: string
    @field(PREMISE_COLUMNS.sourceNoteId) sourceNoteId!: string | null
    @date(PREMISE_COLUMNS.createdAt) createdAt!: Date
    @date(PREMISE_COLUMNS.updatedAt) updatedAt!: Date

    @writer async updatePremise(input: PremiseUpdateInput) {
        await this.update((premise) => {
            premise.content = input.content
            premise.status = input.status
            premise.attitude = input.attitude ?? null
            premise.tagsJson = JSON.stringify(input.tags)
            premise.updatedAt = new Date()
        })
    }
}
