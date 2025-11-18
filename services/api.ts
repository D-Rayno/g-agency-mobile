// services/api.ts
import { SecureStorage } from '@/utils/secure-storage';
import NetInfo from '@react-native-community/netinfo';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3333';

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

class ApiService {
  public client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${BASE_URL}/api`,
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
          return Promise.reject(new Error('No internet connection'));
        }

        // Add auth token for admin routes
        if (config.url?.startsWith('/admin')) {
          const token = await SecureStorage.getItem('auth_access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Add language
        const language = await SecureStorage.getItem('user_language') || 'fr';
        config.headers['Accept-Language'] = language;

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

        // Handle network errors
        if (error.message === 'No internet connection' || error.code === 'ECONNABORTED') {
          this.handleNetworkError();
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
    const refreshToken = await SecureStorage.getItem('auth_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await this.client.post('/admin/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    await SecureStorage.setItem('auth_access_token', accessToken);
    if (newRefreshToken) {
      await SecureStorage.setItem('auth_refresh_token', newRefreshToken);
    }
  }

  private async logout() {
    await SecureStorage.multiRemove(['auth_access_token', 'auth_refresh_token', 'auth_user']);
    router.replace('/(admin)/login');
  }

  private handleNetworkError() {
    Toast.show({
      type: 'error',
      text1: 'Network Error',
      text2: 'Please check your internet connection and try again.',
    });
  }

  private handleApiError(error: AxiosError) {
    const response = error.response;
    let errorMessage = 'An unexpected error occurred';

    if (response?.data) {
      const data = response.data as any;
      errorMessage = data.message || data.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Don't show toast for 401 errors (handled by interceptor)
    if (response?.status !== 401) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  }

  // API Methods with better typing
  async get<T = any>(url: string, params?: any, config?: any): Promise<T> {
    const response = await this.client.get(url, { params, ...config });
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Upload file with progress
  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiService().client;
export const apiService = new ApiService();