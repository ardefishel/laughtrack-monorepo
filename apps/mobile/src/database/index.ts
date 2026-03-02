import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Bit } from './models/bit'
import { Note } from './models/note'
import { Premise } from './models/premise'
import { Setlist } from './models/setlist'
import { migrations } from './migrations'
import { schema } from './schema'

const adapter = new SQLiteAdapter({
    schema,
    migrations,
    onSetUpError: (error: unknown) => {
        console.error('Failed to set up WatermelonDB', error)
    },
})

export const database = new Database({
    adapter,
    modelClasses: [Note, Premise, Bit, Setlist],
})
