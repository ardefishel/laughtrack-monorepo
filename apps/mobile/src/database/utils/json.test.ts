import { dbLogger } from '@/lib/loggers'
import { parseStringArrayJson } from './json'

describe('parseStringArrayJson', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('returns only string entries from JSON arrays', () => {
        expect(parseStringArrayJson('["alpha",1,"beta",null]')).toEqual(['alpha', 'beta'])
    })

    it('returns an empty array for non-array JSON', () => {
        expect(parseStringArrayJson('{"value":"alpha"}')).toEqual([])
    })

    it('returns an empty array and logs a warning for malformed JSON', () => {
        const warnSpy = jest.spyOn(dbLogger, 'warn').mockImplementation(() => dbLogger)

        expect(parseStringArrayJson('not-json')).toEqual([])
        expect(warnSpy).toHaveBeenCalledTimes(1)
    })
})
