import { areEqualIds, normalizedIds } from './ids'

describe('id utils', () => {
    it('normalizes ids by sorting and removing duplicates', () => {
        expect(normalizedIds(['b', 'a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('compares ids by position and length', () => {
        expect(areEqualIds(['a', 'b'], ['a', 'b'])).toBe(true)
        expect(areEqualIds(['a', 'b'], ['b', 'a'])).toBe(false)
        expect(areEqualIds(['a'], ['a', 'b'])).toBe(false)
    })
})
