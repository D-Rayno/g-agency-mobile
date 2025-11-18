// stores/admin-auth.ts
import { adminApi } from '@/services/admin-api';
import { SecureStorage } from '@/utils/secure-storage';
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
    login: (fcmToken?: string) => Promise<boolean>;
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

            // Login
            login: async (fcmToken?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await adminApi.login(fcmToken);

                    if (response.success && response.data) {
                        const { accessToken, refreshToken } = response.data;

                        await SecureStorage.setItem('auth_access_token', accessToken);
                        await SecureStorage.setItem('auth_refresh_token', refreshToken);

                        set({
                            accessToken,
                            refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                        });

                        router.replace('/(admin)/(tabs)');
                        return true;
                    } else {
                        throw new Error(response.message || 'Login failed');
                    }
                } catch (error: any) {
                    set({
                        error: error.message || 'Login failed',
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

                await SecureStorage.multiRemove(['auth_access_token', 'auth_refresh_token']);

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
                const token = await SecureStorage.getItem('auth_access_token');

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
                await SecureStorage.setItem('auth_access_token', accessToken);
                await SecureStorage.setItem('auth_refresh_token', refreshToken);

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