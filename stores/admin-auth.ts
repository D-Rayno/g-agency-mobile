// stores/admin-auth.ts - UPDATED TO USE NEW AUTH SERVICE
import { adminApi } from '@/services/api/admin-api';
import { SecureStorage } from '@/utils/secure-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AdminAuthState {
    // State
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (password: string, deviceId?: string, fcmToken?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    updateFcmToken: (fcmToken: string) => Promise<boolean>;
    clearError: () => void;
    setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Login with password + device info
            login: async (password: string, providedDeviceId?: string, fcmToken?: string) => {
                set({ isLoading: true, error: null });

                // Clear any existing tokens to ensure a clean login
                await SecureStorage.multiRemove(['admin_access_token', 'admin_refresh_token']);

                try {
                    // Generate device info
                    const deviceId = providedDeviceId ||
                        Constants.deviceId ||
                        Device.modelId ||
                        `device_${Date.now()}`;

                    const deviceName = Device.deviceName || 'Unknown Device';
                    const deviceModel = Device.modelName || undefined;
                    const osVersion = Device.osVersion || undefined;
                    const appVersion = Constants.expoConfig?.version || '1.0.0';

                    // Call new auth service
                    const response = await adminApi.login(
                        password,
                        deviceId,
                        deviceName,
                        deviceModel,
                        osVersion,
                        appVersion,
                        fcmToken,
                    );

                    console.log(response)

                    if (response.success && response.data) {
                        const { accessToken, refreshToken } = response.data;

                        await SecureStorage.setItem('admin_access_token', accessToken);
                        await SecureStorage.setItem('admin_refresh_token', refreshToken);

                        set({
                            accessToken,
                            refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                        });

                        return true;
                    } else {
                        throw new Error(response.message || 'Login failed');
                    }
                } catch (error: any) {
                    console.log(error)
                    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Login failed';

                    set({
                        error: errorMessage,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    return false;
                }
            },

            // Logout from current device
            logout: async () => {
                set({ isLoading: true });

                try {
                    await adminApi.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                }

                await SecureStorage.multiRemove(['admin_access_token', 'admin_refresh_token']);

                set({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });

                router.replace('/(auth)/login');
            },

            // Logout from all devices
            logoutAll: async () => {
                set({ isLoading: true });

                try {
                    await adminApi.logoutAll();
                } catch (error) {
                    console.error('Logout all error:', error);
                }

                await SecureStorage.multiRemove(['admin_access_token', 'admin_refresh_token']);

                set({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });

                router.replace('/(auth)/login');
            },

            // Check auth status
            checkAuth: async () => {
                const token = await SecureStorage.getItem('admin_access_token');

                if (!token) {
                    console.log('checkAuth: No token found');
                    set({ isAuthenticated: false });
                    return false;
                }

                try {
                    console.log('checkAuth: Verify token...');
                    const response = await adminApi.checkAuth();
                    console.log('checkAuth: Response', JSON.stringify(response));

                    if ((response.success || response.authenticated) && response.data?.session) {
                        set({
                            accessToken: token,
                            isAuthenticated: true,
                        });
                        return true;
                    } else {
                        console.error('checkAuth: Validation failed', response);
                        throw new Error('Auth check failed');
                    }
                } catch (error) {
                    // console.error('checkAuth: Error', error);
                    await get().logout();
                    return false;
                }
            },

            // Update FCM token for push notifications
            updateFcmToken: async (fcmToken: string) => {
                try {
                    const response = await adminApi.updateFcmToken(fcmToken);
                    return !!response;
                } catch (error) {
                    console.error('Failed to update FCM token:', error);
                    return false;
                }
            },

            // Clear error
            clearError: () => set({ error: null }),

            // Set tokens (used by token refresh)
            setTokens: async (accessToken: string, refreshToken: string) => {
                await SecureStorage.setItem('admin_access_token', accessToken);
                await SecureStorage.setItem('admin_refresh_token', refreshToken);

                set({
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                });
            },
        }),
        {
            name: 'admin-auth-storage',
            storage: createJSONStorage(() => SecureStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);