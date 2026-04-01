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

export interface NoteDTO {
    id: string
    content: string | null
    userId: string
    userName: string | null
    userEmail: string | null
    createdAt: string | null
    updatedAt: string | null
}

export interface BitDTO {
    id: string
    content: string | null
    status: string | null
    tagsJson: string | null
    premiseId: string | null
    userId: string
    userName: string | null
    userEmail: string | null
    createdAt: string | null
    updatedAt: string | null
}

export interface PremiseDTO {
    id: string
    content: string | null
    status: string | null
    attitude: string | null
    tagsJson: string | null
    userId: string
    userName: string | null
    userEmail: string | null
    createdAt: string | null
    updatedAt: string | null
}

export interface SetlistDTO {
    id: string
    description: string | null
    tagsJson: string | null
    userId: string
    userName: string | null
    userEmail: string | null
    createdAt: string | null
    updatedAt: string | null
}

export interface StatsDTO {
    users: number
    notes: number
    bits: number
    premises: number
    setlists: number
}
