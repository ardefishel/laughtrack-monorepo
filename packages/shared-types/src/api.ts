export interface ApiResponse<T> {
    success: boolean
    data: T
    timestamp: string
}

export interface PaginatedApiResponse<T> {
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

export interface UserDTO {
    id: string
    email: string
    name: string
    image: string | null
    role: string
    banned: boolean
    emailVerified: boolean
    createdAt: string
}

export interface UserDetailDTO extends UserDTO {
    banReason: string | null
    notesCount: number
    bitsCount: number
    premisesCount: number
    setlistsCount: number
}

export interface UpdateUserPayload {
    name?: string
    email?: string
    role?: string
    banned?: boolean
    banReason?: string | null
}

export interface JokeDTO {
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

export interface JokeDetailDTO extends JokeDTO {
    draftUpdatedAt: number | null
    tags: string | null
}

export interface JokeSetDTO {
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

export interface JokeSetDetailDTO extends JokeSetDTO {
    items: Array<{
        id: string
        itemType: string | null
        jokeId: string | null
        jokeTitle: string | null
        content: string | null
        position: number | null
    }>
}

export interface StatsDTO {
    users: number
    notes: number
    bits: number
    premises: number
    setlists: number
}
