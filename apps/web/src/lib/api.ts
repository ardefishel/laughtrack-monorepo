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

// Response types matching the backend paginatedResponse/successResponse format
interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

interface PaginatedApiResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp: string
}

// Domain types for web API
export interface User {
  id: string
  email: string
  name: string
  image: string | null
  role: string
  banned: boolean
  emailVerified: boolean
  createdAt: string
}

export interface UserDetail extends User {
  banReason: string | null
  jokesCount: number
  setsCount: number
  audioRecordingsCount: number
  tagsCount: number
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  role?: string
  banned?: boolean
  banReason?: string | null
}

export interface Joke {
  id: string
  contentText: string | null
  contentHtml: string | null
  status: string | null
  userId: string
  userName: string
  userEmail: string
  createdAt: number | null
  updatedAt: number | null
}

export interface JokeDetail extends Joke {
  draftUpdatedAt: number | null
  tags: string | null
}

export interface JokeSet {
  id: string
  title: string | null
  description: string | null
  duration: number | null
  place: string | null
  status: string | null
  userId: string
  userName: string
  userEmail: string
  createdAt: number | null
  updatedAt: number | null
  itemCount: number
}

export interface JokeSetDetail extends JokeSet {
  items: Array<{
    id: string
    itemType: string | null
    jokeId: string | null
    jokeTitle: string | null
    content: string | null
    position: number | null
  }>
}

export interface Stats {
  users: number
  jokes: number
  sets: number
  audioRecordings: number
  tags: number
}

// API functions
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

export async function getJokes(
  page = 1,
  limit = 20,
  userId?: string,
  search?: string,
  status?: string,
  sort?: string,
  order?: 'asc' | 'desc'
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (userId) params.set('userId', userId)
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  if (sort) params.set('sort', sort)
  if (order) params.set('order', order)
  return fetchApi<PaginatedApiResponse<Joke>>(`/api/web/jokes?${params}`)
}

export async function getJoke(id: string) {
  return fetchApi<ApiResponse<JokeDetail>>(`/api/web/jokes/${id}`)
}

export async function getSets(page = 1, limit = 20, userId?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (userId) params.set('userId', userId)
  return fetchApi<PaginatedApiResponse<JokeSet>>(`/api/web/sets?${params}`)
}

export async function getSet(id: string) {
  return fetchApi<ApiResponse<JokeSetDetail>>(`/api/web/sets/${id}`)
}
