// types/api-models.ts
// Comprehensive type definitions for all API models and responses

import type { ApiResponse, Event, EventFilters, PaginatedResponse, Registration, RegistrationFilters, User } from './api';

// Re-export base types from api.ts for convenience
export type { ApiResponse, Event, EventFilters, PaginatedResponse, Registration, RegistrationFilters, User };

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
    password: string;
    deviceId: string;
    deviceName?: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    fcmToken?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    expiresIn: number;
    refreshExpiresAt: string;
    tokenType: 'Bearer';
}

export interface DeviceInfo {
    deviceId: string;
    deviceName?: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
}

export interface LoginResponse extends AuthTokens {
    device: DeviceInfo;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface AuthCheckResponse {
    authenticated: boolean;
    message: string;
    data: {
        device: DeviceInfo;
        session: {
            createdAt: string;
            expiresAt: string;
            lastUsedAt: string;
            loginCount: number;
        };
        security: {
            ipAddress: string;
            failedAttempts: number;
        };
        hasFcmToken: boolean;
    };
}

export interface UpdateFcmTokenRequest {
    fcmToken: string;
}

export interface LogoutDeviceRequest {
    deviceId: string;
}

export interface AuthStats {
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    revokedTokens: number;
    totalDevices: number;
    activeDevices: number;
}

export interface ActiveSession {
    deviceId: string;
    deviceName: string;
    deviceModel: string;
    lastUsedAt: string;
    createdAt: string;
    ipAddress: string;
    isCurrent: boolean;
}

export interface SecurityAlert {
    type: string;
    message: string;
    timestamp: string;
    severity: string;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface CreateEventRequest {
    name: string;
    description: string;
    location: string;
    province: string;
    commune: string;
    startDate: string;
    endDate: string;
    capacity: number;
    category: string;
    minAge?: number;
    maxAge?: number;
    basePrice: number;
    youthPrice?: number;
    seniorPrice?: number;
    requiresApproval?: boolean;
    registrationStartDate?: string;
    registrationEndDate?: string;
}

export interface UpdateEventRequest {
    name?: string;
    description?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    capacity?: number;
    imageUrl?: string;
    category?: string;
    isActive?: boolean;
    isFeatured?: boolean;
}

export interface EventDetails extends Event {
    isFull: boolean;
    isUpcoming: boolean;
    isOngoing: boolean;
    isFinished: boolean;
    difficultyBadge?: {
        text: string;
        color: string;
    };
    intensityBadge?: {
        text: string;
        color: string;
    };
}

export interface EventStats {
    total: number;
    upcoming: number;
    ongoing: number;
    finished: number;
}

export interface UploadImageResponse {
    imageUrl: string;
}

// ============================================================================
// REGISTRATION TYPES
// ============================================================================

export interface RegistrationWithRelations extends Omit<Registration, 'user' | 'event'> {
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
    };
    event: {
        id: number;
        name: string;
        location: string;
        startDate: string;
        endDate: string;
    };
}

export interface RegistrationDetails extends Omit<Registration, 'user' | 'event'> {
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        province: string;
        commune: string;
    };
    event: {
        id: number;
        name: string;
        description: string;
        location: string;
        startDate: string;
        endDate: string;
        capacity: number;
        availableSeats: number;
    };
}

export interface VerifyQrCodeRequest {
    qrCode: string;
}

export interface VerifyQrCodeResponse {
    valid: boolean;
    data: {
        registration: {
            id: number;
            status: string;
            attendedAt: string | null;
        };
        user: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
        };
        event: {
            id: number;
            name: string;
            location: string;
            startDate: string;
            endDate: string;
        };
    };
}

export interface ConfirmAttendanceRequest {
    qrCode: string;
}

export interface ConfirmAttendanceResponse {
    registration: {
        id: number;
        status: 'attended';
        attendedAt: string;
    };
    user: {
        id: number;
        firstName: string;
        lastName: string;
    };
    event: {
        id: number;
        name: string;
    };
}

export interface RegistrationStats {
    total: number;
    confirmed: number;
    attended: number;
    canceled: number;
    recent: number;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserWithStats extends User {
    registrationsCount: number;
}

export interface UserDetails extends User {
    stats: {
        total: number;
        confirmed: number;
        attended: number;
        canceled: number;
    };
    registrations: Array<{
        id: number;
        status: string;
        attendedAt: string | null;
        createdAt: string;
        event: {
            id: number;
            name: string;
            location: string;
            startDate: string;
            endDate: string;
        };
    }>;
}

export interface UserFilters {
    page?: number;
    limit?: number;
    search?: string;
    is_blocked?: boolean;
    is_verified?: boolean;
    is_active?: boolean;
    province?: string;
}

export interface UserStats {
    total: number;
    verified: number;
    blocked: number;
    active: number;
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

export interface BulkUpdateEventsRequest {
    eventIds: number[];
    updates: {
        status?: string;
        isActive?: boolean;
        isFeatured?: boolean;
    };
}

export interface BulkDeleteEventsRequest {
    eventIds: number[];
}

export interface BulkUpdateUsersRequest {
    userIds: number[];
    updates: {
        isBlocked?: boolean;
        isActive?: boolean;
    };
}

export interface BulkDeleteUsersRequest {
    userIds: number[];
}

export interface BulkCancelRegistrationsRequest {
    registrationIds: number[];
}

export interface BulkDeleteRegistrationsRequest {
    registrationIds: number[];
}

export interface BulkOperationResponse {
    updated?: number;
    deleted?: number;
    canceled?: number;
    skipped?: number;
    errors?: string[];
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = 'csv' | 'excel';

export interface ExportFilters {
    status?: string;
    category?: string;
    province?: string;
    [key: string]: any;
}
