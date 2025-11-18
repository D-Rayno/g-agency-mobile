// stores/admin-auth.ts - UPDATED WITH PASSWORD
import { adminApi } from '@/services/admin-api';
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
    checkAuth: () => Promise<boolean>;
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

                    // Call updated API
                    const response = await adminApi.login(
                        password,
                        deviceId,
                        deviceName,
                        deviceModel,
                        osVersion,
                        appVersion,
                        fcmToken
                    );

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

            // Logout
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

                router.replace('/(admin)/login');
            },

            // Check auth
            checkAuth: async () => {
                const token = await SecureStorage.getItem('admin_access_token');

                if (!token) {
                    set({ isAuthenticated: false });
                    return false;
                }

                try {
                    const response = await adminApi.checkAuth();

                    if (response.success) {
                        set({
                            accessToken: token,
                            isAuthenticated: true,
                        });
                        return true;
                    } else {
                        throw new Error('Auth check failed');
                    }
                } catch (error) {
                    await get().logout();
                    return false;
                }
            },

            // Clear error
            clearError: () => set({ error: null }),

            // Set tokens
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