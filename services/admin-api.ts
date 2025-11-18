// services/admin-api.ts
import type {
    AdminSession,
    AdminStats,
    ApiResponse,
    Event,
    PaginatedResponse,
    Registration,
    User,
} from '@/types/admin';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { apiService } from './api';

class AdminApiService {
    // ============================================
    // AUTH
    // ============================================

    async login(fcmToken?: string) {
        const deviceInfo = {
            deviceId: Constants.deviceId || Device.modelId || 'unknown',
            deviceName: Device.deviceName || 'Unknown Device',
            deviceModel: Device.modelName,
            osVersion: Device.osVersion,
            appVersion: Constants.expoConfig?.version || '1.0.0',
            fcmToken,
        };

        const response = await apiService.post<ApiResponse<{
            accessToken: string;
            refreshToken: string;
            expiresAt: string;
            expiresIn: number;
            refreshExpiresAt: string;
        }>>('/auth/login', deviceInfo);

        return response;
    }

    async checkAuth() {
        return apiService.get<ApiResponse<{
            device: any;
            session: any;
            security: any;
            hasFcmToken: boolean;
        }>>('/auth/check');
    }

    async logout() {
        return apiService.post<ApiResponse>('/auth/logout');
    }

    async logoutAll() {
        return apiService.post<ApiResponse>('/auth/logout-all');
    }

    async logoutDevice(deviceId: string) {
        return apiService.post<ApiResponse>('/auth/logout-device', { deviceId });
    }

    async getSessions() {
        return apiService.get<ApiResponse<{
            count: number;
            sessions: AdminSession[];
        }>>('/auth/sessions');
    }

    async getAuthStats() {
        return apiService.get<ApiResponse<{
            total: number;
            active: number;
            expired: number;
            revoked: number;
            uniqueDevices: number;
            uniqueIps: number;
        }>>('/auth/stats');
    }

    async updateFcmToken(fcmToken: string) {
        return apiService.post<ApiResponse>('/auth/update-fcm-token', { fcmToken });
    }

    async getSecurityAlerts() {
        return apiService.get<ApiResponse<{
            count: number;
            alerts: any[];
        }>>('/auth/security-alerts');
    }

    // ============================================
    // EVENTS
    // ============================================

    async getEvents(params?: {
        page?: number;
        search?: string;
        category?: string;
        province?: string;
        eventType?: string;
        gameType?: string;
        difficulty?: string;
        status?: string;
        is_public?: string;
    }) {
        return apiService.get<ApiResponse<PaginatedResponse<Event>>>('/events', params);
    }

    async getEvent(id: number) {
        return apiService.get<ApiResponse<Event>>(`/events/${id}`);
    }

    async createEvent(data: Partial<Event>) {
        return apiService.post<ApiResponse<{ id: number; name: string }>>('/events', data);
    }

    async updateEvent(id: number, data: Partial<Event>) {
        return apiService.put<ApiResponse<{ id: number; name: string }>>(`/events/${id}`, data);
    }

    async deleteEvent(id: number) {
        return apiService.delete<ApiResponse>(`/events/${id}`);
    }

    async getEventStats() {
        return apiService.get<ApiResponse<AdminStats['events']>>('/events/stats');
    }

    // ============================================
    // USERS
    // ============================================

    async getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        is_blocked?: string;
        is_verified?: string;
        is_active?: string;
        province?: string;
    }) {
        return apiService.get<ApiResponse<PaginatedResponse<User>>>('/users', params);
    }

    async getUser(id: number) {
        return apiService.get<ApiResponse<User & {
            stats: {
                total: number;
                confirmed: number;
                attended: number;
                canceled: number;
            };
            registrations: Registration[];
        }>>(`/users/${id}`);
    }

    async toggleUserBlock(id: number) {
        return apiService.patch<ApiResponse<{ id: number; isBlocked: boolean }>>(`/users/${id}/toggle-block`, {});
    }

    async toggleUserActive(id: number) {
        return apiService.patch<ApiResponse<{ id: number; isActive: boolean }>>(`/users/${id}/toggle-active`, {});
    }

    async deleteUser(id: number) {
        return apiService.delete<ApiResponse>(`/users/${id}`);
    }

    async getUserStats() {
        return apiService.get<ApiResponse<AdminStats['users']>>('/users/stats');
    }

    // ============================================
    // REGISTRATIONS
    // ============================================

    async getRegistrations(params?: {
        page?: number;
        limit?: number;
        status?: string;
        event_id?: number;
        user_id?: number;
        search?: string;
    }) {
        return apiService.get<ApiResponse<PaginatedResponse<Registration>>>('/registrations', params);
    }

    async getRegistration(id: number) {
        return apiService.get<ApiResponse<Registration>>(`/registrations/${id}`);
    }

    async verifyQRCode(qrCode: string) {
        return apiService.post<ApiResponse<{
            valid: boolean;
            registration?: Registration;
        }>>('/registrations/verify', { qrCode });
    }

    async confirmAttendance(qrCode: string) {
        return apiService.post<ApiResponse<{
            registration: Registration;
        }>>('/registrations/confirm', { qrCode });
    }

    async cancelRegistration(id: number) {
        return apiService.delete<ApiResponse>(`/registrations/${id}`);
    }

    async getRegistrationStats() {
        return apiService.get<ApiResponse<AdminStats['registrations']>>('/registrations/stats');
    }

    // ============================================
    // EXPORTS
    // ============================================

    async exportEventsCSV(params?: { status?: string; category?: string }) {
        return apiService.get('/exports/events/csv', params);
    }

    async exportEventsExcel(params?: { status?: string; category?: string }) {
        return apiService.get('/exports/events/excel', params);
    }

    async exportUsersCSV(params?: { province?: string; is_blocked?: string }) {
        return apiService.get('/exports/users/csv', params);
    }

    async exportUsersExcel(params?: { province?: string; is_blocked?: string }) {
        return apiService.get('/exports/users/excel', params);
    }

    async exportRegistrationsCSV(params?: { status?: string; event_id?: string }) {
        return apiService.get('/exports/registrations/csv', params);
    }

    async exportRegistrationsExcel(params?: { status?: string; event_id?: string }) {
        return apiService.get('/exports/registrations/excel', params);
    }

    // ============================================
    // BULK OPERATIONS
    // ============================================

    async bulkUpdateEvents(eventIds: number[], updates: Partial<Event>) {
        return apiService.put<ApiResponse<{ updated: number; fields: string[] }>>('/bulk/events', {
            eventIds,
            updates,
        });
    }

    async bulkDeleteEvents(eventIds: number[]) {
        return apiService.delete<ApiResponse<{ deleted: number }>>('/bulk/events', {
            data: { eventIds },
        });
    }

    async bulkUpdateUsers(userIds: number[], updates: { is_blocked?: boolean; is_active?: boolean }) {
        return apiService.put<ApiResponse<{ updated: number; fields: string[] }>>('/bulk/users', {
            userIds,
            updates,
        });
    }

    async bulkDeleteUsers(userIds: number[]) {
        return apiService.delete<ApiResponse<{ deleted: number }>>('/bulk/users', {
            data: { userIds },
        });
    }

    async bulkCancelRegistrations(registrationIds: number[]) {
        return apiService.post<ApiResponse<{ canceled: number }>>('/bulk/registrations/cancel', {
            registrationIds,
        });
    }

    async bulkDeleteRegistrations(registrationIds: number[]) {
        return apiService.delete<ApiResponse<{ deleted: number }>>('/bulk/registrations', {
            data: { registrationIds },
        });
    }
}

export const adminApi = new AdminApiService();