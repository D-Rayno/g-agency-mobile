// types/api.ts

export interface ApiResponse<T = any> {
    success: boolean
    message?: string
    data?: T
    error?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        current_page: number
        last_page: number
        total: number
        per_page: number
    }
}

export interface Event {
    id: number
    name: string
    description: string
    imageUrl: string | null
    location: string
    province: string
    commune: string
    startDate: string
    endDate: string
    capacity: number
    registeredCount: number
    availableSeats: number
    minAge: number
    maxAge: number | null
    basePrice: number
    youthPrice: number | null
    seniorPrice: number | null
    status: 'draft' | 'published' | 'ongoing' | 'finished' | 'cancelled'
    isPublic: boolean
    requiresApproval: boolean
    category: string
    tags: string[]
    registrationStartDate: string | null
    registrationEndDate: string | null
    isActive: boolean
    isFeatured: boolean
    // Game fields
    eventType?: string | null
    gameType?: string | null
    difficulty?: 'easy' | 'medium' | 'hard' | 'extreme' | null
    durationMinutes?: number | null
    physicalIntensity?: 'low' | 'medium' | 'high'
    allowsTeams?: boolean
    teamRegistration?: 'individual' | 'team' | 'both'
    minTeamSize?: number | null
    maxTeamSize?: number | null
    maxTeams?: number | null
    autoTeamFormation?: boolean
    requiredItems?: string[] | null
    prohibitedItems?: string[] | null
    safetyRequirements?: string[] | null
    waiverRequired?: boolean
    rulesDocumentUrl?: string | null
    checkInTime?: string | null
    briefingDurationMinutes?: number | null
    prizeInformation?: string | null
    prizePool?: number | null
    winnerAnnouncement?: string | null
    photographyAllowed?: boolean
    liveStreaming?: boolean
    specialInstructions?: string | null
    createdAt: string
    updatedAt: string | null
}

export interface User {
    id: number
    firstName: string
    lastName: string
    fullName: string
    email: string
    age: number
    province: string
    commune: string
    phoneNumber: string | null
    avatarUrl: string | null
    isEmailVerified: boolean
    emailVerifiedAt: string | null
    isActive: boolean
    isBlocked: boolean
    isAdmin: boolean
    createdAt: string
}

export interface Registration {
    id: number
    userId: number
    eventId: number
    status: 'pending' | 'confirmed' | 'attended' | 'canceled'
    qrCode: string
    price: number
    attendedAt: string | null
    createdAt: string
    updatedAt: string | null
    user?: User
    event?: Event
}

export interface EventFilters {
    search?: string
    category?: string
    province?: string
    eventType?: string
    gameType?: string
    difficulty?: string
    status?: string
    isPublic?: string
    page?: number
}

export interface RegistrationFilters {
    status?: string
    eventId?: number
    userId?: number
    search?: string
    page?: number
    limit?: number
}

export interface ApiError {
    error: string
    message: string
    code?: string
}