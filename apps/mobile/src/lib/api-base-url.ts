import { resolveApiBaseUrl } from './normalize-api-base-url'

export const API_BASE_URL = resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_URL)
