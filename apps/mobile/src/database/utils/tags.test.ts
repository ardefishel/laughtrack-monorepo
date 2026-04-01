import { tagNamesToTags, toTagId } from './tags'

describe('tag utils', () => {
    it('derives deterministic tag ids from names', () => {
        expect(toTagId('Funny Story')).toBe('tag-funny-story')
    })

    it('maps tag names into tag objects with shared timestamps', () => {
        const createdAt = new Date('2026-03-14T00:00:00.000Z')
        const updatedAt = new Date('2026-03-14T01:00:00.000Z')

        expect(tagNamesToTags(['Opener', 'Closer'], createdAt, updatedAt)).toEqual([
            {
                id: 'tag-opener',
                name: 'Opener',
                createdAt,
                updatedAt,
            },
            {
                id: 'tag-closer',
                name: 'Closer',
                createdAt,
                updatedAt,
            },
        ])
    })
})
