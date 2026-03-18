import type { Database } from '@nozbe/watermelondb'
import { PREMISE_TABLE } from '../constants'
import { Premise } from '../models/premise'
import { createTestDatabase, teardownTestDatabase } from '../test-utils/create-test-database'
import { syncBitPremiseRelation } from './bit-premise-sync'

describe('syncBitPremiseRelation', () => {
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

    async function createPremise(input: { id: string; bitIdsJson?: string }): Promise<Premise> {
        const now = Date.now()

        return database.write(async () =>
            database.get<Premise>(PREMISE_TABLE).create((premise) => {
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
        )
    }

    async function readPremiseBitIds(id: string): Promise<string[]> {
        const premise = await database.get<Premise>(PREMISE_TABLE).find(id)
        return JSON.parse(premise.bitIdsJson) as string[]
    }

    it('moves a bit id from the previous premise to the next premise', async () => {
        await createPremise({ id: 'premise-old', bitIdsJson: '["bit-1","bit-2"]' })
        await createPremise({ id: 'premise-new', bitIdsJson: '["bit-3"]' })

        await syncBitPremiseRelation({
            database,
            bitId: 'bit-1',
            previousPremiseId: 'premise-old',
            nextPremiseId: 'premise-new',
        })

        await expect(readPremiseBitIds('premise-old')).resolves.toEqual(['bit-2'])
        await expect(readPremiseBitIds('premise-new')).resolves.toEqual(['bit-3', 'bit-1'])
    })

    it('avoids duplicate links when the next premise already contains the bit', async () => {
        await createPremise({ id: 'premise-next', bitIdsJson: '["bit-1"]' })

        await syncBitPremiseRelation({
            database,
            bitId: 'bit-1',
            previousPremiseId: null,
            nextPremiseId: 'premise-next',
        })

        await expect(readPremiseBitIds('premise-next')).resolves.toEqual(['bit-1'])
    })

    it('does nothing when the relation is unchanged', async () => {
        await createPremise({ id: 'premise-same', bitIdsJson: '["bit-1"]' })

        await syncBitPremiseRelation({
            database,
            bitId: 'bit-1',
            previousPremiseId: 'premise-same',
            nextPremiseId: 'premise-same',
        })

        await expect(readPremiseBitIds('premise-same')).resolves.toEqual(['bit-1'])
    })
})
