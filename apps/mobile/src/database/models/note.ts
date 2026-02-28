import { Model } from '@nozbe/watermelondb'
import { date, field, writer } from '@nozbe/watermelondb/decorators'
import { NOTE_TABLE } from '../constants'
import { NOTE_COLUMNS } from '../noteSchema'

export class Note extends Model {
    static table = NOTE_TABLE

    @field(NOTE_COLUMNS.content) content!: string
    @date(NOTE_COLUMNS.createdAt) createdAt!: Date
    @date(NOTE_COLUMNS.updatedAt) updatedAt!: Date

    @writer async updateContent(nextContent: string) {
        await this.update((note) => {
            note.content = nextContent
            note.updatedAt = new Date()
        })
    }
}
