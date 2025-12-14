// services/admin-api.ts - UPDATED WITH PASSWORD LOGIN
import type {
    AdminSession,
    AdminStats,
    ApiResponse,
    Event,
    PaginatedApiResponse,
    Registration,
    User,
} from '@/types/admin';
import { SecureStorage } from '@/utils/secure-storage';
import CookieManager from '@react-native-cookies/cookies';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3333';

class AdminApiService {
    private client: AxiosInstance;
    private isRefreshing = false;
    private csrfToken: string | null = null;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    constructor() {
        this.client = axios.create({
            baseURL: `${BASE_URL}/api/admin`,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        this.setupInterceptors();
    }


    private extractCsrfToken(value: string): string | null {
        if (!value) return null;

        // Decode the URL-encoded token
        const decoded = decodeURIComponent(value);

        // If it's in e: format (encrypted), extract the actual value
        if (decoded.startsWith('e:')) {
            // AdonisJS encrypted cookie format: e:payload.signature
            const token = decoded.substring(2).split('.')[0];
            return token;
        }

        return decoded;
    }

    private async fetchCsrfToken(): Promise<void> {
        try {
            console.log('Fetching CSRF token...');

            // Make a request to trigger CSRF cookie setting
            await axios.get(`${BASE_URL}/api/admin/auth/check`, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            // Get cookies using the cookie manager
            const cookies = await CookieManager.get(BASE_URL);
            console.log('Cookies from server:', JSON.stringify(cookies, null, 2));

            if (cookies && cookies['XSRF-TOKEN']) {
                const token = this.extractCsrfToken(cookies['XSRF-TOKEN'].value);
                if (token) {
                    this.csrfToken = token;
                    console.log('CSRF token extracted successfully');
                } else {
                    console.log('Failed to extract CSRF token value');
                }
            } else {
                console.log('No XSRF-TOKEN cookie found');
            }
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            async (config) => {
                const token = await SecureStorage.getItem('admin_access_token');
                // Don't attach token for login requests
                const isLoginRequest = config.url?.includes('/auth/login');
                if (token && !isLoginRequest) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add CSRF token for state-changing requests
                const isStateMutatingRequest = ['post', 'put', 'patch', 'delete'].includes(
                    config.method?.toLowerCase() || ''
                );

                if (isStateMutatingRequest) {
                    // Fetch CSRF token if we don't have one
                    if (!this.csrfToken) {
                        await this.fetchCsrfToken();
                    }

                    // Add CSRF token to headers
                    if (this.csrfToken) {
                        config.headers['X-XSRF-TOKEN'] = this.csrfToken;
                    }
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (!originalRequest) {
                    return Promise.reject(error);
                }

                // Handle CSRF token errors (403 with CSRF message)
                const errorData = error.response?.data as any;
                const isCsrfError = error.response?.status === 403 &&
                    (errorData?.error === 'InvalidCSRFToken' ||
                        errorData?.code === 'E_BAD_CSRF_TOKEN' ||
                        errorData?.message?.toLowerCase().includes('csrf'));

                if (isCsrfError && !originalRequest._csrfRetry) {
                    console.log('CSRF token error detected, refetching and retrying...');
                    originalRequest._csrfRetry = true;

                    // Clear the cached CSRF token and fetch a new one
                    this.csrfToken = null;
                    await this.fetchCsrfToken();

                    // Retry the request with the new token
                    if (this.csrfToken) {
                        originalRequest.headers['X-XSRF-TOKEN'] = this.csrfToken;
                    }

                    return this.client(originalRequest);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    // Don't retry login requests on 401
                    if (originalRequest.url?.includes('/auth/login')) {
                        return Promise.reject(error);
                    }

                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        }).then(() => this.client(originalRequest));
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        await this.refreshToken();
                        this.processQueue(null);
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError);
                        await this.handleLogout();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    private processQueue(error: any) {
        this.failedQueue.forEach((promise) => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve();
            }
        });
        this.failedQueue = [];
    }

    private async refreshToken() {
        const refreshToken = await SecureStorage.getItem('admin_refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await this.client.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await SecureStorage.setItem('admin_access_token', accessToken);
        if (newRefreshToken) {
            await SecureStorage.setItem('admin_refresh_token', newRefreshToken);
        }
    }

    private async handleLogout() {
        await SecureStorage.multiRemove(['admin_access_token', 'admin_refresh_token']);
        router.replace('/(auth)/login');
        Toast.show({
            type: 'error',
            text1: 'Session Expired',
            text2: 'Please sign in again.',
        });
    }

    private handleError(error: AxiosError) {
        let errorMessage = 'An unexpected error occurred';

        console.log('--- API ERROR ---');
        console.log('URL:', error.config?.url);
        console.log('Status:', error.response?.status);
        console.log('Headers:', JSON.stringify(error.response?.headers));
        // Limit data logging to avoid flooding if it's a huge HTML
        const responseData = typeof error.response?.data === 'string'
            ? (error.response?.data as string).substring(0, 500)
            : JSON.stringify(error.response?.data);
        console.log('Data:', responseData);
        console.log('-----------------');

        if (error.response?.data) {
            const data = error.response.data as any;
            errorMessage = data.message || data.error || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }

        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
        });
    }

    // ============================================
    // AUTH - UPDATED WITH PASSWORD
    // ============================================

    async login(
        password: string,
        deviceId: string,
        deviceName: string,
        deviceModel?: string,
        osVersion?: string,
        appVersion?: string,
        fcmToken?: string
    ) {

        const response = await this.client.post<ApiResponse<{
            accessToken: string;
            refreshToken: string;
            expiresAt: string;
            expiresIn: number;
            refreshExpiresAt: string;
        }>>('/auth/login', {
            password,
            deviceId,
            deviceName,
            deviceModel,
            osVersion,
            appVersion,
            fcmToken,
        });


        return response.data;
    }

    async checkAuth() {
        const response = await this.client.get<ApiResponse<{
            device: any;
            session: any;
            security: any;
            hasFcmToken: boolean;
        }>>('/auth/check');
        return response.data;
    }

    async logout() {
        const response = await this.client.post<ApiResponse>('/auth/logout');
        return response.data;
    }

    async logoutAll() {
        const response = await this.client.post<ApiResponse>('/auth/logout-all');
        return response.data;
    }

    async logoutDevice(deviceId: string) {
        const response = await this.client.post<ApiResponse>('/auth/logout-device', { deviceId });
        return response.data;
    }

    async getSessions() {
        const response = await this.client.get<ApiResponse<{
            count: number;
            sessions: AdminSession[];
        }>>('/auth/sessions');
        return response.data;
    }

    async getAuthStats() {
        const response = await this.client.get<ApiResponse<{
            total: number;
            active: number;
            expired: number;
            revoked: number;
            uniqueDevices: number;
            uniqueIps: number;
        }>>('/auth/stats');
        return response.data;
    }

    async updateFcmToken(fcmToken: string) {
        const response = await this.client.post<ApiResponse>('/auth/update-fcm-token', { fcmToken });
        return response.data;
    }

    async getSecurityAlerts() {
        const response = await this.client.get<ApiResponse<{
            count: number;
            alerts: any[];
        }>>('/auth/security-alerts');
        return response.data;
    }

    // ============================================
    // EVENTS (unchanged)
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
        const response = await this.client.get<PaginatedApiResponse<Event>>('/events', { params });
        return response.data;
    }

    async getEvent(id: number) {
        const response = await this.client.get<ApiResponse<Event>>(`/events/${id}`);
        return response.data;
    }

    async createEvent(data: Partial<Event>) {
        const response = await this.client.post<ApiResponse<{ id: number; name: string }>>('/events', data);
        return response.data;
    }

    async updateEvent(id: number, data: Partial<Event>) {
        const response = await this.client.put<ApiResponse<{ id: number; name: string }>>(`/events/${id}`, data);
        return response.data;
    }

    async deleteEvent(id: number) {
        const response = await this.client.delete<ApiResponse>(`/events/${id}`);
        return response.data;
    }

    async getEventStats() {
        const response = await this.client.get<ApiResponse<AdminStats['events']>>('/events/stats');
        return response.data;
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
        const response = await this.client.get<PaginatedApiResponse<User>>('/users', { params });
        return response.data;
    }

    async getUser(id: number) {
        const response = await this.client.get<ApiResponse<User & {
            stats: {
                total: number;
                confirmed: number;
                attended: number;
                canceled: number;
            };
            registrations: Registration[];
        }>>(`/users/${id}`);
        return response.data;
    }

    async toggleUserBlock(id: number) {
        const response = await this.client.patch<ApiResponse<{ id: number; isBlocked: boolean }>>(`/users/${id}/toggle-block`, {});
        return response.data;
    }

    async toggleUserActive(id: number) {
        const response = await this.client.patch<ApiResponse<{ id: number; isActive: boolean }>>(`/users/${id}/toggle-active`, {});
        return response.data;
    }

    async deleteUser(id: number) {
        const response = await this.client.delete<ApiResponse>(`/users/${id}`);
        return response.data;
    }

    async getUserStats() {
        const response = await this.client.get<ApiResponse<AdminStats['users']>>('/users/stats');
        return response.data;
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
        const response = await this.client.get<PaginatedApiResponse<Registration>>('/registrations', { params });
        return response.data;
    }

    async getRegistration(id: number) {
        const response = await this.client.get<ApiResponse<Registration>>(`/registrations/${id}`);
        return response.data;
    }

    async verifyQRCode(qrCode: string) {
        const response = await this.client.post<ApiResponse<{
            valid: boolean;
            registration?: Registration;
        }>>('/registrations/verify', { qrCode });
        return response.data;
    }

    async confirmAttendance(qrCode: string) {
        const response = await this.client.post<ApiResponse<{
            registration: Registration;
        }>>('/registrations/confirm', { qrCode });
        return response.data;
    }

    async cancelRegistration(id: number) {
        const response = await this.client.delete<ApiResponse>(`/registrations/${id}`);
        return response.data;
    }

    async getRegistrationStats() {
        const response = await this.client.get<ApiResponse<AdminStats['registrations']>>('/registrations/stats');
        return response.data;
    }

    // ============================================
    // EXPORTS
    // ============================================

    async exportEventsCSV(params?: { status?: string; category?: string }) {
        const response = await this.client.get('/exports/events/csv', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportEventsExcel(params?: { status?: string; category?: string }) {
        const response = await this.client.get('/exports/events/excel', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportUsersCSV(params?: { province?: string; is_blocked?: string }) {
        const response = await this.client.get('/exports/users/csv', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportUsersExcel(params?: { province?: string; is_blocked?: string }) {
        const response = await this.client.get('/exports/users/excel', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportRegistrationsCSV(params?: { status?: string; event_id?: string }) {
        const response = await this.client.get('/exports/registrations/csv', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportRegistrationsExcel(params?: { status?: string; event_id?: string }) {
        const response = await this.client.get('/exports/registrations/excel', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    // ============================================
    // BULK OPERATIONS
    // ============================================

    async bulkUpdateEvents(eventIds: number[], updates: Partial<Event>) {
        const response = await this.client.put<ApiResponse<{ updated: number; fields: string[] }>>('/bulk/events', {
            eventIds,
            updates,
        });
        return response.data;
    }

    async bulkDeleteEvents(eventIds: number[]) {
        const response = await this.client.delete<ApiResponse<{ deleted: number }>>('/bulk/events', {
            data: { eventIds },
        });
        return response.data;
    }

    async bulkUpdateUsers(userIds: number[], updates: { is_blocked?: boolean; is_active?: boolean }) {
        const response = await this.client.put<ApiResponse<{ updated: number; fields: string[] }>>('/bulk/users', {
            userIds,
            updates,
        });
        return response.data;
    }

    async bulkDeleteUsers(userIds: number[]) {
        const response = await this.client.delete<ApiResponse<{ deleted: number }>>('/bulk/users', {
            data: { userIds },
        });
        return response.data;
    }

    async bulkCancelRegistrations(registrationIds: number[]) {
        const response = await this.client.post<ApiResponse<{ canceled: number }>>('/bulk/registrations/cancel', {
            registrationIds,
        });
        return response.data;
    }

    async bulkDeleteRegistrations(registrationIds: number[]) {
        const response = await this.client.delete<ApiResponse<{ deleted: number }>>('/bulk/registrations', {
            data: { registrationIds },
        });
        return response.data;
    }
}

export const adminApi = new AdminApiService();