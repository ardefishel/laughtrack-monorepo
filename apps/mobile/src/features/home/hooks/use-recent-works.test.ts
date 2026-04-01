import { dbLogger } from '@/lib/loggers'
import { bitToRecentWork, premiseToRecentWork, setlistToRecentWork } from './use-recent-works'

describe('useRecentWorks helpers', () => {
    beforeEach(() => {
        jest.spyOn(dbLogger, 'warn').mockImplementation(() => dbLogger)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('maps valid recent work records', () => {
        const updatedAt = new Date('2026-03-17T00:00:00.000Z')

        expect(premiseToRecentWork({ id: 'premise-1', content: 'Premise', updatedAt })).toEqual({
            id: 'premise-1',
            type: 'premise',
            title: 'Premise',
            updatedAt,
        })

        expect(bitToRecentWork({ id: 'bit-1', content: '<p>Bit body</p>', updatedAt })).toEqual({
            id: 'bit-1',
            type: 'bit',
            title: 'Bit body',
            updatedAt,
        })

        expect(setlistToRecentWork({ id: 'set-1', description: 'Setlist', updatedAt })).toEqual({
            id: 'set-1',
            type: 'set',
            title: 'Setlist',
            updatedAt,
        })
    })

    it('skips malformed recent work records instead of throwing', () => {
        expect(premiseToRecentWork({ id: 'premise-1', content: null, updatedAt: new Date() })).toBeNull()
        expect(bitToRecentWork({ id: 'bit-1', content: '<p>Bit body</p>', updatedAt: 'bad-date' })).toBeNull()
        expect(setlistToRecentWork({ id: 'set-1', description: 42, updatedAt: new Date() })).toBeNull()
    })
})
