const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

import type {
  ApiResponse,
  BitDTO as Bit,
  NoteDTO as Note,
  PaginatedApiResponse,
  PremiseDTO as Premise,
  SetlistDTO as Setlist,
  StatsDTO as Stats,
  UpdateUserPayload,
  UserDTO as User,
  UserDetailDTO as UserDetail
} from '@laughtrack/shared-types'

export type {
  ApiResponse, PaginatedApiResponse, Stats, UpdateUserPayload, User,
  UserDetail,
  Note,
  Bit,
  Premise,
  Setlist
}

export async function getStats(): Promise<Stats> {
  const res = await fetchApi<ApiResponse<Stats>>('/api/web/stats')
  return res.data
}

export async function getUsers(page = 1, limit = 20, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  return fetchApi<PaginatedApiResponse<User>>(`/api/web/users?${params}`)
}

export async function getUser(id: string) {
  return fetchApi<ApiResponse<UserDetail>>(`/api/web/users/${id}`)
}

export async function updateUser(id: string, data: UpdateUserPayload) {
  return fetchApi<ApiResponse<UserDetail>>(`/api/web/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function getNotes(page = 1, limit = 20, userId?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (userId) params.set('userId', userId)
  return fetchApi<PaginatedApiResponse<Note>>(`/api/web/notes?${params}`)
}

export async function getBits(page = 1, limit = 20, userId?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (userId) params.set('userId', userId)
  return fetchApi<PaginatedApiResponse<Bit>>(`/api/web/bits?${params}`)
}

export async function getPremises(page = 1, limit = 20, userId?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (userId) params.set('userId', userId)
  return fetchApi<PaginatedApiResponse<Premise>>(`/api/web/premises?${params}`)
}

export async function getSetlists(page = 1, limit = 20, userId?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (userId) params.set('userId', userId)
  return fetchApi<PaginatedApiResponse<Setlist>>(`/api/web/setlists?${params}`)
}
