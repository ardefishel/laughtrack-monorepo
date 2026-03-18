const DEFAULT_API_BASE_URL = 'https://api.laughtrack.rtvcl.com'

export function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

export function resolveApiBaseUrl(url?: string): string {
  const trimmedUrl = url?.trim()

  return normalizeApiBaseUrl(trimmedUrl ? trimmedUrl : DEFAULT_API_BASE_URL)
}
