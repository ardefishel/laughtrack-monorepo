import { decodeHtmlEntities, stripHtmlToLines } from './html'

describe('html utils', () => {
    it('decodes supported HTML entities', () => {
        expect(decodeHtmlEntities('&lt;tag&gt; &amp; &#39;quote&#39;')).toBe('<tag> & \'quote\'')
    })

    it('strips tags into normalized text lines', () => {
        expect(stripHtmlToLines('<p>Hello&nbsp;world</p><div>Second<br />line</div><ul><li>Third</li></ul>')).toEqual([
            'Hello world',
            'Second',
            'line',
            'Third',
        ])
    })
})
