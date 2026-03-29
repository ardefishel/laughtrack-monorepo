import { appSchema, tableSchema } from '@nozbe/watermelondb'
import { BIT_TABLE_SCHEMA } from '@/features/bit/data/bit.schema'
import { NOTE_TABLE_SCHEMA } from '@/features/note/data/note.schema'
import { PREMISE_TABLE_SCHEMA } from '@/features/premise/data/premise.schema'
import { SETLIST_TABLE_SCHEMA } from '@/features/setlist/data/setlist.schema'

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema(NOTE_TABLE_SCHEMA),
        tableSchema(PREMISE_TABLE_SCHEMA),
        tableSchema(BIT_TABLE_SCHEMA),
        tableSchema(SETLIST_TABLE_SCHEMA),
    ],
})
