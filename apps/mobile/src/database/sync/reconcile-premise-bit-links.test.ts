import type { Database } from '@nozbe/watermelondb'
import { BIT_TABLE, PREMISE_TABLE } from '../constants'
import { Bit } from '../models/bit'
import { Premise } from '../models/premise'
import { createTestDatabase, teardownTestDatabase } from '../test-utils/create-test-database'
import { reconcilePremiseBitLinks } from './reconcile-premise-bit-links'

describe('reconcilePremiseBitLinks', () => {
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

    async function createPremise(input: { id: string; bitIdsJson?: string }): Promise<void> {
        const now = Date.now()

        await database.write(async () => {
            await database.get<Premise>(PREMISE_TABLE).create((premise) => {
                premise._raw.id = input.id
                premise.content = `Premise ${input.id}`
                premise.status = 'draft'
                premise.attitude = null
                premise.tagsJson = '[]'
                premise.bitIdsJson = input.bitIdsJson ?? '[]'
                premise.sourceNoteId = null
                premise.createdAt = new Date(now)
                premise.updatedAt = new Date(now)
            })
        })
    }

    async function createBit(input: { id: string; premiseId: string | null }): Promise<void> {
        const now = Date.now()

        await database.write(async () => {
            await database.get<Bit>(BIT_TABLE).create((bit) => {
                bit._raw.id = input.id
                bit.content = `Bit ${input.id}`
                bit.status = 'draft'
                bit.tagsJson = '[]'
                bit.premiseId = input.premiseId
                bit.setlistIdsJson = '[]'
                bit.createdAt = new Date(now)
                bit.updatedAt = new Date(now)
            })
        })
    }

    async function readPremiseBitIds(id: string): Promise<string[]> {
        const premise = await database.get<Premise>(PREMISE_TABLE).find(id)
        return JSON.parse(premise.bitIdsJson) as string[]
    }

    it('rebuilds bit links from persisted bit premise ids', async () => {
        await createPremise({ id: 'premise-a', bitIdsJson: '["stale-bit"]' })
        await createPremise({ id: 'premise-b', bitIdsJson: '[]' })

        await createBit({ id: 'bit-2', premiseId: 'premise-a' })
        await createBit({ id: 'bit-1', premiseId: 'premise-a' })
        await createBit({ id: 'bit-3', premiseId: 'premise-b' })
        await createBit({ id: 'bit-orphan', premiseId: 'missing-premise' })

        await expect(reconcilePremiseBitLinks(database)).resolves.toBe(2)
        await expect(readPremiseBitIds('premise-a')).resolves.toEqual(['bit-1', 'bit-2'])
        await expect(readPremiseBitIds('premise-b')).resolves.toEqual(['bit-3'])
    })

    it('returns zero when no premise links need updating', async () => {
        await createPremise({ id: 'premise-a', bitIdsJson: '["bit-1"]' })
        await createBit({ id: 'bit-1', premiseId: 'premise-a' })

        await expect(reconcilePremiseBitLinks(database)).resolves.toBe(0)
    })
})
