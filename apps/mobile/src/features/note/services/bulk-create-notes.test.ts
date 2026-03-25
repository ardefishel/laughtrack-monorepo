import { parseNotesFromText } from './bulk-create-notes'

describe('parseNotesFromText', () => {
    it('returns empty array for empty string', () => {
        expect(parseNotesFromText('')).toEqual([])
    })

    it('returns empty array for whitespace-only string', () => {
        expect(parseNotesFromText('   \n  \n   ')).toEqual([])
    })

    it('returns single note for single paragraph', () => {
        expect(parseNotesFromText('hello world')).toEqual(['hello world'])
    })

    it('splits on single blank line', () => {
        const input = 'first note\n\nsecond note'
        expect(parseNotesFromText(input)).toEqual(['first note', 'second note'])
    })

    it('splits on multiple consecutive blank lines', () => {
        const input = 'first note\n\n\n\nsecond note'
        expect(parseNotesFromText(input)).toEqual(['first note', 'second note'])
    })

    it('preserves newlines within a paragraph', () => {
        const input = 'line one\nline two\n\nline three'
        expect(parseNotesFromText(input)).toEqual(['line one\nline two', 'line three'])
    })

    it('trims leading and trailing whitespace per segment', () => {
        const input = '  first note  \n\n  second note  '
        expect(parseNotesFromText(input)).toEqual(['first note', 'second note'])
    })

    it('discards whitespace-only segments', () => {
        const input = 'first note\n\n   \n\nsecond note'
        expect(parseNotesFromText(input)).toEqual(['first note', 'second note'])
    })

    it('handles lines with only spaces as blank separators', () => {
        const input = 'first note\n   \nsecond note'
        expect(parseNotesFromText(input)).toEqual(['first note', 'second note'])
    })

    it('handles the example from the plan', () => {
        const input = `i have this note today.
people might think blabla

asdasdasdasd
asdasdasd

the third note here`

        expect(parseNotesFromText(input)).toEqual([
            'i have this note today.\npeople might think blabla',
            'asdasdasdasd\nasdasdasd',
            'the third note here',
        ])
    })

    it('handles trailing blank lines', () => {
        const input = 'only note\n\n\n'
        expect(parseNotesFromText(input)).toEqual(['only note'])
    })

    it('handles leading blank lines', () => {
        const input = '\n\nonly note'
        expect(parseNotesFromText(input)).toEqual(['only note'])
    })
})
