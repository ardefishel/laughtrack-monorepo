import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { Bit } from '../models/bit'
import { Note } from '../models/note'
import { Premise } from '../models/premise'
import { Setlist } from '../models/setlist'
import { migrations } from '../migrations'
import { schema } from '../schema'

export function createTestDatabase(): Database {
    const adapter = new LokiJSAdapter({
        dbName: `laughtrack-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        schema,
        migrations,
        useWebWorker: false,
        useIncrementalIndexedDB: false,
    })

    return new Database({
        adapter,
        modelClasses: [Note, Premise, Bit, Setlist],
    })
}

type TestLokiAdapter = {
    _driver?: {
        loki?: {
            close: () => void
        }
    }
}

export async function teardownTestDatabase(database: Database): Promise<void> {
    await database.write(async () => {
        await database.unsafeResetDatabase()
    })

    const underlyingAdapter = Reflect.get(database.adapter, 'underlyingAdapter') as TestLokiAdapter | undefined
    underlyingAdapter?._driver?.loki?.close()
}
