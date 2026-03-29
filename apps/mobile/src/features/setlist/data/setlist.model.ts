import { Model } from '@nozbe/watermelondb'
import { date, field, writer } from '@nozbe/watermelondb/decorators'
import type { SetlistItem, Tag } from '@/types'
import { SETLIST_TABLE } from '@/database/constants'
import { SETLIST_COLUMNS } from './setlist.schema'

type SetlistUpdateInput = {
    description: string
    items: SetlistItem[]
    tags: Tag[]
}

export class Setlist extends Model {
    static table = SETLIST_TABLE

    @field(SETLIST_COLUMNS.description) description!: string
    @field(SETLIST_COLUMNS.itemsJson) itemsJson!: string
    @field(SETLIST_COLUMNS.tagsJson) tagsJson!: string
    @date(SETLIST_COLUMNS.createdAt) createdAt!: Date
    @date(SETLIST_COLUMNS.updatedAt) updatedAt!: Date

    @writer async updateSetlist(input: SetlistUpdateInput) {
        await this.update((setlist) => {
            setlist.description = input.description
            setlist.itemsJson = JSON.stringify(input.items)
            setlist.tagsJson = JSON.stringify(input.tags)
            setlist.updatedAt = new Date()
        })
    }
}
