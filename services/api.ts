// src/services/api.ts
import { SecureStorage } from '@/utils/secure-storage';
import * as NetInfo from '@react-native-community/netinfo';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

// Types
export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
  USER_LANGUAGE: 'user_language',
} as const;

// Base URL from environment
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3333';

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
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

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('No internet connection');
        }

        // Add auth token
        const token = await SecureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add language header
        const language = await SecureStorage.getItem(STORAGE_KEYS.USER_LANGUAGE);
        if (language) {
          config.headers['Accept-Language'] = language;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
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
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        this.handleApiError(error);
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
    try {
      const refreshToken = await SecureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.client.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data.data;

      await SecureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      if (refresh_token) {
        await SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      }

      return response.data;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  private async logout() {
    try {
      // Clear stored tokens
      await Promise.all([
        SecureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStorage.removeItem(STORAGE_KEYS.USER),
      ]);

      // Navigate to login
      router.replace('/(auth)/login');

      // Show session expired message
      Toast.show({
        type: 'error',
        text1: 'Session Expired',
        text2: 'Please sign in again.',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  private handleApiError(error: AxiosError<ApiResponse>) {
    let errorMessage = 'An unexpected error occurred';

    if (error.response?.data) {
      const { message, errors } = error.response.data;
      
      if (message) {
        errorMessage = message;
      } else if (errors && Object.keys(errors).length > 0) {
        // Get first error message from validation errors
        const firstField = Object.keys(errors)[0];
        errorMessage = errors[firstField][0];
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show toast notification
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  }

  // Generic request method
  async request<T = any>(config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    data?: any;
    params?: any;
    headers?: any;
  }): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request({ method: 'GET', url, params });
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request({ method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request({ method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request({ method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request({ method: 'DELETE', url });
  }

  // Auth specific methods for AdonisJS backend
  async login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials);
  }

  async logoutApi() {
    return this.post('/auth/logout');
  }

  async logoutAll() {
    return this.post('/auth/logout-all');
  }

  async checkAuth() {
    return this.get('/auth/check');
  }

  async updateFcmToken(fcmToken: string) {
    return this.post('/auth/update-fcm-token', { fcm_token: fcmToken });
  }

  // Event methods
  async getEvents(params?: any) {
    return this.get('/events', params);
  }

  async getEvent(id: string) {
    return this.get(`/events/${id}`);
  }

  async createEvent(data: any) {
    return this.post('/events', data);
  }

  async updateEvent(id: string, data: any) {
    return this.put(`/events/${id}`, data);
  }

  async deleteEvent(id: string) {
    return this.delete(`/events/${id}`);
  }

  // Registration methods
  async getRegistrations(params?: any) {
    return this.get('/registrations', params);
  }

  async verifyQRCode(qrCode: string) {
    return this.post('/registrations/verify', { qr_code: qrCode });
  }

  async confirmAttendance(registrationId: string) {
    return this.post('/registrations/confirm', { registration_id: registrationId });
  }

  async cancelRegistration(id: string) {
    return this.delete(`/registrations/${id}`);
  }

  // User methods
  async getUsers(params?: any) {
    return this.get('/users', params);
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }

  async toggleUserBlock(id: string) {
    return this.patch(`/users/${id}/toggle-block`, {});
  }

  async toggleUserActive(id: string) {
    return this.patch(`/users/${id}/toggle-active`, {});
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }

  // Export methods
  async exportEventsCSV(params?: any) {
    return this.get('/exports/events/csv', params);
  }

  async exportEventsExcel(params?: any) {
    return this.get('/exports/events/excel', params);
  }

  async exportUsersCSV(params?: any) {
    return this.get('/exports/users/csv', params);
  }

  async exportUsersExcel(params?: any) {
    return this.get('/exports/users/excel', params);
  }

  async exportRegistrationsCSV(params?: any) {
    return this.get('/exports/registrations/csv', params);
  }

  async exportRegistrationsExcel(params?: any) {
    return this.get('/exports/registrations/excel', params);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiService };
