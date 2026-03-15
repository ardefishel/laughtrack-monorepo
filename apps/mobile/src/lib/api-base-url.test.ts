import { normalizeApiBaseUrl, resolveApiBaseUrl } from './normalize-api-base-url'

describe('api base url helpers', () => {
    it('uses the default API base URL when the environment value is missing', () => {
        expect(resolveApiBaseUrl(undefined)).toBe('https://api.laughtrack.rtvcl.com')
    })

    it('uses the default API base URL for blank environment values', () => {
        expect(resolveApiBaseUrl('')).toBe('https://api.laughtrack.rtvcl.com')
        expect(resolveApiBaseUrl('   ')).toBe('https://api.laughtrack.rtvcl.com')
    })

    it('normalizes trailing slashes from provided URLs', () => {
        expect(normalizeApiBaseUrl('https://laughtrack.test///')).toBe('https://laughtrack.test')
        expect(resolveApiBaseUrl('https://laughtrack.test///')).toBe('https://laughtrack.test')
    })
})
