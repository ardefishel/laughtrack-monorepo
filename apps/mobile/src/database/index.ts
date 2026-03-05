import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Bit } from './models/bit'
import { Note } from './models/note'
import { Premise } from './models/premise'
import { Setlist } from './models/setlist'
import { migrations } from './migrations'
import { schema } from './schema'
import { dbLogger } from '@/lib/loggers'

dbLogger.info('Initializing WatermelonDB adapter')

const adapter = new SQLiteAdapter({
    schema,
    migrations,
    onSetUpError: (error: unknown) => {
        dbLogger.error('Failed to set up WatermelonDB', error)
    },
})

export const database = new Database({
    adapter,
    modelClasses: [Note, Premise, Bit, Setlist],
})

dbLogger.info('WatermelonDB initialized')
