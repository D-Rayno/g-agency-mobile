// services/api.ts - Fixed for React Native
import { SecureStorage } from '@/utils/secure-storage';
import NetInfo from '@react-native-community/netinfo';
import axios, { AxiosInstance } from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3333';

class ApiService {
  public client: AxiosInstance;
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
        // Check network
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('No internet connection');
        }

        // Add auth token
        const token = await SecureStorage.getItem('auth_access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add language
        const language = await SecureStorage.getItem('user_language');
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
      async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Handle 401
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
    const refreshToken = await SecureStorage.getItem('auth_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await this.client.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    await SecureStorage.setItem('auth_access_token', accessToken);
    if (newRefreshToken) {
      await SecureStorage.setItem('auth_refresh_token', newRefreshToken);
    }
  }

  private async logout() {
    await SecureStorage.multiRemove(['auth_access_token', 'auth_refresh_token', 'auth_user']);
    router.replace('/(auth)/login');
    Toast.show({
      type: 'error',
      text1: 'Session Expired',
      text2: 'Please sign in again.',
    });
  }

  private handleApiError(error: any) {
    let errorMessage = 'An unexpected error occurred';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  }

  // API Methods
  async get<T = any>(url: string, params?: any) {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any) {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any) {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any) {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T = any>(url: string) {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiClient = new ApiService().client;
export const apiService = new ApiService();