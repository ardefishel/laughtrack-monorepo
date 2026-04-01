import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import app from '../../index'

type ContractCall = {
  method: string
  path: string
  source: 'apps/web/src/lib/api.ts'
}

function normalizePath(rawPath: string): string {
  const withoutInterpolation = rawPath.replace(/\$\{[^}]+\}/g, 'test-id')
  const withoutQuery = withoutInterpolation.split('?')[0] ?? withoutInterpolation
  return withoutQuery
}

function extractWebApiContractCalls(webApiSource: string): ContractCall[] {
  const calls: ContractCall[] = []

  const recordCall = (rawPath: string, methodGuess: string) => {
    const normalized = normalizePath(rawPath)
    if (!normalized.startsWith('/api/web/')) return
    calls.push({ method: methodGuess, path: normalized, source: 'apps/web/src/lib/api.ts' })
  }

  const singleQuote = /fetchApi[^\(]*\(\s*'([^']+)'/g
  const doubleQuote = /fetchApi[^\(]*\(\s*"([^"]+)"/g
  const template = /fetchApi[^\(]*\(\s*`([^`]+)`/g

  const scan = (re: RegExp) => {
    for (const match of webApiSource.matchAll(re)) {
      const rawPath = match[1]
      if (!rawPath) continue

      const matchIndex = match.index ?? 0
      const window = webApiSource.slice(matchIndex, matchIndex + 240)
      const method = window.includes("method: 'PUT'") || window.includes('method: "PUT"') ? 'PUT' : 'GET'

      recordCall(rawPath, method)
    }
  }

  scan(singleQuote)
  scan(doubleQuote)
  scan(template)

  const seen = new Set<string>()
  return calls.filter((call) => {
    const key = `${call.method} ${call.path}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

describe('web/backend admin contract drift', () => {
  it('all endpoints referenced by the web API client resolve to a non-404 backend route', async () => {
    const webApiPath = path.resolve(process.cwd(), '../web/src/lib/api.ts')
    const webApiSource = readFileSync(webApiPath, 'utf8')
    const calls = extractWebApiContractCalls(webApiSource)

    expect(calls.length).toBeGreaterThan(0)

    const failures: Array<{ method: string; path: string; status: number }> = []

    for (const call of calls) {
      const response = await app.request(call.path, { method: call.method })
      if (response.status === 404) {
        failures.push({ method: call.method, path: call.path, status: response.status })
      }
    }

    expect(failures).toEqual([])
  })

  it('unauthenticated admin routes return the standard API error shape', async () => {
    const response = await app.request('/api/web/stats')
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      success: false,
      error: 'Unauthorized',
      details: undefined,
      timestamp: body.timestamp,
    })
    expect(typeof body.timestamp).toBe('string')
  })
})
