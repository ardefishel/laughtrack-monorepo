const DEFAULT_API_BASE_URL = 'https://api.laughtrack.rtvcl.com'

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL)
