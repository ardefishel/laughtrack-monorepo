import { didExpandHeadingStyleAcrossBlocks, extractBlockTagSequence } from './html'

describe('extractBlockTagSequence', () => {
    it('extracts block tags in document order', () => {
        const html = '<html><h1>Title</h1><p>body</p><h2>Sub</h2></html>'
        expect(extractBlockTagSequence(html)).toEqual(['h1', 'p', 'h2'])
    })

    it('extracts nested block tags inside blockquote', () => {
        const html = '<blockquote><p>quoted</p></blockquote><p>normal</p>'
        expect(extractBlockTagSequence(html)).toEqual(['p', 'p'])
    })

    it('returns empty array for html with no block tags', () => {
        expect(extractBlockTagSequence('<html><br></html>')).toEqual([])
        expect(extractBlockTagSequence('')).toEqual([])
    })
})

describe('didExpandHeadingStyleAcrossBlocks', () => {
    describe('detects heading expansion (returns true)', () => {
        it('single p converted to h1 alongside existing h2', () => {
            const prev = '<html><h1>A</h1><p>B</p><h2>C</h2></html>'
            const next = '<html><h1>A</h1><h1>B</h1><h2>C</h2></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(true)
        })

        it('multiple p tags converted to h1 with h2 remaining', () => {
            const prev = '<html><h1>A</h1><p>B</p><p>C</p><h2>D</h2><p>E</p></html>'
            const next = '<html><h1>A</h1><h1>B</h1><h1>C</h1><h2>D</h2><h1>E</h1></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(true)
        })

        it('all non-heading blocks converted to heading', () => {
            const prev = '<html><h1>A</h1><p>B</p><p>C</p></html>'
            const next = '<html><h1>A</h1><h1>B</h1><h1>C</h1></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(true)
        })

        it('p inside blockquote converted to h1', () => {
            const prev = '<html><h1>A</h1><blockquote><p>Q</p></blockquote><p>B</p></html>'
            const next = '<html><h1>A</h1><blockquote><h1>Q</h1></blockquote><h1>B</h1></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(true)
        })

        it('exact repro from bug report — h1+p+blockquote+h2 mix', () => {
            const prev =
                '<html>\n<h1>hdjskksns</h1>\n<p>z</p>\n<p>z</p>\n<blockquote>\n<p>ahxbznnss</p>\n</blockquote>\n<p>a</p>\n<h2>sddd</h2>\n<p><u>xhxbfbf</u></p>\n</html>'
            const next =
                '<html>\n<h1>hdjskksns</h1>\n<h1>z</h1>\n<h1>z</h1>\n<blockquote>\n<h1>ahxbznnss</h1>\n</blockquote>\n<h1>a</h1>\n<h2>sddd</h2>\n<h1><u>xhxbfbf</u></h1>\n</html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(true)
        })

        it('h2 expansion into p blocks', () => {
            const prev = '<html><h2>A</h2><p>B</p><p>C</p></html>'
            const next = '<html><h2>A</h2><h2>B</h2><h2>C</h2></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h2')).toBe(true)
        })
    })

    describe('ignores non-expansion scenarios (returns false)', () => {
        it('no change in block tags', () => {
            const html = '<html><h1>A</h1><p>B</p><h2>C</h2></html>'
            expect(didExpandHeadingStyleAcrossBlocks(html, html, 'h1')).toBe(false)
        })

        it('all blocks already the active heading', () => {
            const html = '<html><h1>A</h1><h1>B</h1><h1>C</h1></html>'
            expect(didExpandHeadingStyleAcrossBlocks(html, html, 'h1')).toBe(false)
        })

        it('fewer than 2 blocks', () => {
            const prev = '<html><h1>A</h1></html>'
            const next = '<html><h1>A</h1></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(false)
        })

        it('different block count (insertion or removal)', () => {
            const prev = '<html><h1>A</h1><p>B</p></html>'
            const next = '<html><h1>A</h1><h1>B</h1><h1>C</h1></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(false)
        })

        it('heading converted away from active heading (not expansion)', () => {
            const prev = '<html><h1>A</h1><h1>B</h1><p>C</p></html>'
            const next = '<html><h1>A</h1><p>B</p><p>C</p></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(false)
        })

        it('blocks swap types without net heading increase', () => {
            const prev = '<html><h1>A</h1><p>B</p></html>'
            const next = '<html><p>A</p><h1>B</h1></html>'
            expect(didExpandHeadingStyleAcrossBlocks(prev, next, 'h1')).toBe(false)
        })
    })
})
