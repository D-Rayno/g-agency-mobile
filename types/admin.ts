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
    imageUrl?: string;
    status: 'draft' | 'published' | 'ongoing' | 'finished' | 'cancelled';
    isPublic: boolean;
    capacity: number;
    registeredCount: number;
    availableSeats: number;
    basePrice: number;
    eventType?: string;
    gameType?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
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
    phoneNumber?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    isBlocked: boolean;
    registrationsCount: number;
    createdAt: string;
}

export interface Registration {
    id: number;
    status: 'pending' | 'confirmed' | 'attended' | 'canceled';
    qrCode: string;
    attendedAt?: string;
    createdAt: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
    };
    event: {
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

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}