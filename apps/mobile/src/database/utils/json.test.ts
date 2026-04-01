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

    it('extracts names from {name: string} objects', () => {
        expect(parseStringArrayJson('[{"name":"alpha"},{"name":"beta"}]')).toEqual(['alpha', 'beta'])
    })

    it('handles mixed string and {name: string} formats', () => {
        expect(parseStringArrayJson('["alpha",{"name":"beta"},42,null]')).toEqual(['alpha', 'beta'])
    })

    it('returns an empty array and logs a warning for malformed JSON', () => {
        const warnSpy = jest.spyOn(dbLogger, 'warn').mockImplementation(() => dbLogger)

        expect(parseStringArrayJson('not-json')).toEqual([])
        expect(warnSpy).toHaveBeenCalledTimes(1)
    })
})
