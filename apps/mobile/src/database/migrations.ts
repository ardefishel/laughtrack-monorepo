import { createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { SETLIST_TABLE_SCHEMA } from './setlistSchema'

export const migrations = schemaMigrations({
    migrations: [
        {
            toVersion: 2,
            steps: [createTable(SETLIST_TABLE_SCHEMA)],
        },
    ],
})
