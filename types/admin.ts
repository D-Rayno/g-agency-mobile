// types/admin.ts
export interface AdminDevice {
    deviceId: string;
    deviceName: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
}

export interface AdminSession {
    tokenPreview: string;
    deviceId: string;
    deviceName: string;
    deviceModel: string;
    osVersion: string;
    appVersion: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
    lastUsedAt: string;
    isExpired: boolean;
    isRevoked: boolean;
    failedAttempts: number;
    loginCount: number;
    hasFcmToken: boolean;
    timeRemaining: number;
    daysSinceLastUse: number;
}

export interface AdminStats {
    events: {
        total: number;
        published: number;
        upcoming: number;
        ongoing: number;
        finished: number;
    };
    registrations: {
        total: number;
        confirmed: number;
        attended: number;
        canceled: number;
        recent: number;
    };
    users: {
        total: number;
        verified: number;
        blocked: number;
        active: number;
    };
}

export interface Event {
    id: number;
    name: string;
    description: string;
    province: string;
    commune: string;
    location: string;
    startDate: string;
    endDate: string;
    category: string;
    imageUrl: string | null;
    status: 'draft' | 'published' | 'ongoing' | 'finished' | 'cancelled';
    isPublic: boolean;
    capacity: number;
    registeredCount: number;
    availableSeats: number;
    minAge: number;
    maxAge: number | null;
    basePrice: number;
    youthPrice: number | null;
    seniorPrice: number | null;
    requiresApproval: boolean;
    tags: string[];
    registrationStartDate: string | null;
    registrationEndDate: string | null;
    isActive: boolean;
    isFeatured: boolean;
    eventType: string | null;
    gameType: string | null;
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | null;
    durationMinutes: number | null;
    physicalIntensity: 'low' | 'medium' | 'high' | null;
    allowsTeams: boolean;
    teamRegistration: 'individual' | 'team' | 'both' | null;
    minTeamSize: number | null;
    maxTeamSize: number | null;
    maxTeams: number | null;
    autoTeamFormation: boolean;
    requiredItems: string[] | null;
    prohibitedItems: string[] | null;
    safetyRequirements: string[] | null;
    waiverRequired: boolean;
    rulesDocumentUrl: string | null;
    checkInTime: string | null;
    briefingDurationMinutes: number | null;
    prizeInformation: string | null;
    prizePool: number | null;
    winnerAnnouncement: string | null;
    photographyAllowed: boolean;
    liveStreaming: boolean;
    specialInstructions: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    age: number;
    province: string;
    commune: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    isActive: boolean;
    isBlocked: boolean;
    isAdmin: boolean;
    registrationsCount: number;
    createdAt: string;
    updatedAt: string | null;
}

export interface Registration {
    id: number;
    userId: number;
    eventId: number;
    status: 'pending' | 'confirmed' | 'attended' | 'canceled';
    qrCode: string;
    price: number;
    attendedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
    event?: {
        id: number;
        name: string;
        location: string;
        startDate: string;
        endDate: string;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

// API response where data is array with meta at root
export interface PaginatedApiResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    message?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    authenticated?: boolean;
    message?: string;
    data?: T;
    error?: string;
}