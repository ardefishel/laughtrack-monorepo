import { appSchema, tableSchema } from '@nozbe/watermelondb'
import { BIT_TABLE_SCHEMA } from './bitSchema'
import { NOTE_TABLE_SCHEMA } from './noteSchema'
import { PREMISE_TABLE_SCHEMA } from './premiseSchema'
import { SETLIST_TABLE_SCHEMA } from './setlistSchema'

export const schema = appSchema({
    version: 3,
    tables: [
        tableSchema(NOTE_TABLE_SCHEMA),
        tableSchema(PREMISE_TABLE_SCHEMA),
        tableSchema(BIT_TABLE_SCHEMA),
        tableSchema(SETLIST_TABLE_SCHEMA),
    ],
})
