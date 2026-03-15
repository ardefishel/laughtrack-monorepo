import { timeAgo } from './time-ago'

describe('timeAgo', () => {
    const now = new Date('2026-03-14T00:00:00.000Z')

    beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('formats recent timestamps as just now', () => {
        expect(timeAgo(new Date('2026-03-13T23:59:31.000Z'))).toBe('Just now')
    })

    it('formats minutes, hours, days, weeks, months, and years', () => {
        expect(timeAgo(new Date('2026-03-13T23:55:00.000Z'))).toBe('5m ago')
        expect(timeAgo(new Date('2026-03-13T21:00:00.000Z'))).toBe('3h ago')
        expect(timeAgo(new Date('2026-03-11T00:00:00.000Z'))).toBe('3d ago')
        expect(timeAgo(new Date('2026-02-28T00:00:00.000Z'))).toBe('2w ago')
        expect(timeAgo(new Date('2025-12-20T00:00:00.000Z'))).toBe('2mo ago')
        expect(timeAgo(new Date('2024-03-14T00:00:00.000Z'))).toBe('2y ago')
    })
})
