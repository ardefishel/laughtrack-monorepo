import { parseBooleanParam, parseCsvParam, toCsvParam } from './filter-query'

describe('filter-query', () => {
    describe('parseCsvParam', () => {
        it('returns an empty array for missing values', () => {
            expect(parseCsvParam()).toEqual([])
            expect(parseCsvParam('')).toEqual([])
        })

        it('trims entries and removes blanks', () => {
            expect(parseCsvParam(' draft, tested , , final ')).toEqual(['draft', 'tested', 'final'])
        })
    })

    describe('parseBooleanParam', () => {
        it('parses explicit boolean strings', () => {
            expect(parseBooleanParam('true')).toBe(true)
            expect(parseBooleanParam('false')).toBe(false)
        })

        it('returns null for unsupported values', () => {
            expect(parseBooleanParam()).toBeNull()
            expect(parseBooleanParam('TRUE')).toBeNull()
            expect(parseBooleanParam('yes')).toBeNull()
        })
    })

    describe('toCsvParam', () => {
        it('serializes iterables into comma-separated values', () => {
            expect(toCsvParam(['draft', 'final'])).toBe('draft,final')
        })

        it('returns an empty string for an empty iterable', () => {
            expect(toCsvParam([])).toBe('')
        })
    })
})
