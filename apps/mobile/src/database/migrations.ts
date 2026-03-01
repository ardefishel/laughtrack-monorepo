import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { PREMISE_TABLE } from './constants'
import { PREMISE_COLUMNS } from './premiseSchema'
import { SETLIST_TABLE_SCHEMA } from './setlistSchema'

export const migrations = schemaMigrations({
    migrations: [
        {
            toVersion: 3,
            steps: [
                addColumns({
                    table: PREMISE_TABLE,
                    columns: [{ name: PREMISE_COLUMNS.sourceNoteId, type: 'string', isOptional: true }],
                }),
            ],
        },
        {
            toVersion: 2,
            steps: [createTable(SETLIST_TABLE_SCHEMA)],
        },
    ],
})
