// services/auth.service.ts
import type {
    ActiveSession,
    ApiResponse,
    AuthCheckResponse,
    AuthStats,
    AuthTokens,
    LoginRequest,
    LoginResponse,
    LogoutDeviceRequest,
    RefreshTokenRequest,
    SecurityAlert,
    UpdateFcmTokenRequest,
} from '@/types/api-models';
import { apiService } from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
    private readonly basePath = '/admin/auth';

    /**
     * Login with password and device information
     * @param credentials - Login credentials and device info
     * @returns Authentication tokens and device information
     */
    async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        return apiService.post<ApiResponse<LoginResponse>>(
            `${this.basePath}/login`,
            credentials
        );
    }

    /**
     * Refresh access token using refresh token
     * @param request - Refresh token request
     * @returns New authentication tokens
     */
    async refreshToken(request: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> {
        return apiService.post<ApiResponse<AuthTokens>>(
            `${this.basePath}/refresh`,
            request
        );
    }

    /**
     * Check if current access token is valid
     * @returns Authentication status and session information
     */
    async checkAuth(): Promise<AuthCheckResponse> {
        return apiService.get<AuthCheckResponse>(`${this.basePath}/check`);
    }

    /**
     * Update Firebase Cloud Messaging token for push notifications
     * @param request - FCM token update request
     * @returns Success response
     */
    async updateFcmToken(request: UpdateFcmTokenRequest): Promise<ApiResponse> {
        return apiService.post<ApiResponse>(
            `${this.basePath}/update-fcm-token`,
            request
        );
    }

    /**
     * Logout from current device
     * @returns Success response
     */
    async logout(): Promise<ApiResponse> {
        return apiService.post<ApiResponse>(`${this.basePath}/logout`);
    }

    /**
     * Logout from all devices
     * @returns Success response
     */
    async logoutAll(): Promise<ApiResponse> {
        return apiService.post<ApiResponse>(`${this.basePath}/logout-all`);
    }

    /**
     * Logout a specific device
     * @param request - Device logout request
     * @returns Success response
     */
    async logoutDevice(request: LogoutDeviceRequest): Promise<ApiResponse> {
        return apiService.post<ApiResponse>(
            `${this.basePath}/logout-device`,
            request
        );
    }

    /**
     * Get authentication statistics
     * @returns Authentication statistics
     */
    async getStats(): Promise<ApiResponse<AuthStats>> {
        return apiService.get<ApiResponse<AuthStats>>(`${this.basePath}/stats`);
    }

    /**
     * List all active sessions across all devices
     * @returns List of active sessions
     */
    async getSessions(): Promise<ApiResponse<{ count: number; sessions: ActiveSession[] }>> {
        return apiService.get<ApiResponse<{ count: number; sessions: ActiveSession[] }>>(
            `${this.basePath}/sessions`
        );
    }

    /**
     * Get security alerts
     * @returns List of security alerts
     */
    async getSecurityAlerts(): Promise<ApiResponse<{ count: number; alerts: SecurityAlert[] }>> {
        return apiService.get<ApiResponse<{ count: number; alerts: SecurityAlert[] }>>(
            `${this.basePath}/security-alerts`
        );
    }
}

export const authService = new AuthService();
