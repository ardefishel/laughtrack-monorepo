import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, SETLIST_TABLE } from '../constants'
import { Bit } from '../models/bit'
import { Setlist } from '../models/setlist'
import { createTestDatabase, teardownTestDatabase } from '../test-utils/create-test-database'
import { reconcileSetlistBitLinks } from './reconcile-setlist-bit-links'

describe('reconcileSetlistBitLinks', () => {
    let database: Database

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => undefined)
        jest.spyOn(console, 'warn').mockImplementation(() => undefined)
        database = createTestDatabase()
    })

    afterEach(async () => {
        await teardownTestDatabase(database)
        jest.restoreAllMocks()
    })

    async function createBit(input: { id: string; setlistIdsJson?: string }): Promise<void> {
        const now = Date.now()

        await database.write(async () => {
            await database.get<Bit>(BIT_TABLE).create((bit) => {
                bit._raw.id = input.id
                bit.content = `Bit ${input.id}`
                bit.status = 'draft'
                bit.tagsJson = '[]'
                bit.premiseId = null
                bit.setlistIdsJson = input.setlistIdsJson ?? '[]'
                bit.createdAt = new Date(now)
                bit.updatedAt = new Date(now)
            })
        })
    }

    async function createSetlist(input: { id: string; itemsJson: string }): Promise<void> {
        const now = Date.now()

        await database.write(async () => {
            await database.get<Setlist>(SETLIST_TABLE).create((setlist) => {
                setlist._raw.id = input.id
                setlist.description = `Setlist ${input.id}`
                setlist.itemsJson = input.itemsJson
                setlist.tagsJson = '[]'
                setlist.createdAt = new Date(now)
                setlist.updatedAt = new Date(now)
            })
        })
    }

    async function readBitSetlistIds(id: string): Promise<string[]> {
        const bit = await database.get<Bit>(BIT_TABLE).find(id)
        return JSON.parse(bit.setlistIdsJson) as string[]
    }

    it('rebuilds setlist ids from setlist items', async () => {
        await createBit({ id: 'bit-1', setlistIdsJson: '["stale"]' })
        await createBit({ id: 'bit-2', setlistIdsJson: '[]' })
        await createBit({ id: 'bit-3', setlistIdsJson: '[]' })

        await createSetlist({
            id: 'setlist-a',
            itemsJson: JSON.stringify([
                { id: 'item-1', type: 'bit', bitId: 'bit-2' },
                { id: 'item-2', type: 'bit', bitId: 'bit-1' },
                { id: 'item-3', type: 'set-note', setlistNote: { id: 'note-1', content: 'hello' } },
            ]),
        })
        await createSetlist({
            id: 'setlist-b',
            itemsJson: JSON.stringify([
                { id: 'item-4', type: 'bit', bitId: 'bit-1' },
                { id: 'item-5', type: 'bit', bitId: 'bit-3' },
            ]),
        })

        await expect(reconcileSetlistBitLinks(database)).resolves.toBe(3)
        await expect(readBitSetlistIds('bit-1')).resolves.toEqual(['setlist-a', 'setlist-b'])
        await expect(readBitSetlistIds('bit-2')).resolves.toEqual(['setlist-a'])
        await expect(readBitSetlistIds('bit-3')).resolves.toEqual(['setlist-b'])
    })

    it('returns zero when setlist links are already accurate', async () => {
        await createBit({ id: 'bit-1', setlistIdsJson: '["setlist-a"]' })
        await createSetlist({
            id: 'setlist-a',
            itemsJson: JSON.stringify([{ id: 'item-1', type: 'bit', bitId: 'bit-1' }]),
        })

        await expect(reconcileSetlistBitLinks(database)).resolves.toBe(0)
    })
})
