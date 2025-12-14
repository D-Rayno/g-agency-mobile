// stores/users.ts
import { usersService } from '@/services/api';
import type {
    UserDetails,
    UserFilters,
    UserStats,
    UserWithStats,
} from '@/types/api-models';
import { create } from 'zustand';

interface UsersState {
    // Data
    users: UserWithStats[];
    selectedUser: UserDetails | null;
    stats: UserStats | null;

    // Pagination
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    perPage: number;

    // Filters
    filters: UserFilters;

    // UI State
    isLoading: boolean;
    isRefreshing: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;

    // Cache
    lastFetchTime: number | null;
    cacheTimeout: number; // 5 minutes

    // Actions
    fetchUsers: (filters?: UserFilters, page?: number, force?: boolean) => Promise<void>;
    fetchUserById: (id: number, force?: boolean) => Promise<void>;
    toggleBlockStatus: (id: number) => Promise<boolean>;
    toggleActiveStatus: (id: number) => Promise<boolean>;
    deleteUser: (id: number) => Promise<boolean>;
    fetchStats: (force?: boolean) => Promise<void>;
    setFilters: (filters: UserFilters) => void;
    refreshUsers: () => Promise<void>;
    clearCache: () => void;
    selectUser: (id: number | null) => void;
    clearError: () => void;
}

export const useUsersStore = create<UsersState>()((set, get) => ({
    // Initial state
    users: [],
    selectedUser: null,
    stats: null,

    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    perPage: 50,

    filters: {},

    isLoading: false,
    isRefreshing: false,
    isUpdating: false,
    isDeleting: false,
    error: null,

    lastFetchTime: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes

    // Fetch users with caching
    fetchUsers: async (filters?: UserFilters, page = 1, force = false) => {
        const state = get();
        const now = Date.now();

        // Check cache
        const shouldFetch = force ||
            !state.lastFetchTime ||
            (now - state.lastFetchTime) > state.cacheTimeout ||
            JSON.stringify(filters) !== JSON.stringify(state.filters) ||
            page !== state.currentPage;

        if (!shouldFetch && state.users.length > 0) {
            console.log('📦 Using cached users');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await usersService.getUsers({ ...filters, page });

            if (response.success && response.data) {
                set({
                    users: response.data.data,
                    currentPage: response.data.meta.current_page,
                    totalPages: response.data.meta.last_page,
                    totalUsers: response.data.meta.total,
                    perPage: response.data.meta.per_page,
                    filters: filters || {},
                    lastFetchTime: now,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message || 'Failed to fetch users');
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch users:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch users',
                isLoading: false,
            });
        }
    },

    // Fetch user by ID
    fetchUserById: async (id: number, force = false) => {
        const state = get();

        if (!force && state.selectedUser?.id === id) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await usersService.getUserById(id);

            if (response.success && response.data) {
                set({
                    selectedUser: response.data,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message || 'Failed to fetch user');
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch user:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch user',
                isLoading: false,
            });
        }
    },

    // Toggle block status
    toggleBlockStatus: async (id: number) => {
        set({ isUpdating: true, error: null });

        // Optimistic update
        const state = get();
        const originalUsers = state.users;
        const originalSelected = state.selectedUser;

        const updatedUsers = state.users.map(user =>
            user.id === id ? { ...user, isBlocked: !user.isBlocked } : user
        );
        set({ users: updatedUsers });

        if (state.selectedUser?.id === id) {
            set({ selectedUser: { ...state.selectedUser, isBlocked: !state.selectedUser.isBlocked } });
        }

        try {
            const response = await usersService.toggleBlockStatus(id);

            if (response.success && response.data) {
                set({ isUpdating: false });

                // Update with server response
                const updatedUsers = state.users.map(user =>
                    user.id === id ? { ...user, isBlocked: response.data!.isBlocked } : user
                );
                set({ users: updatedUsers });

                if (state.selectedUser?.id === id) {
                    set({ selectedUser: { ...state.selectedUser, isBlocked: response.data!.isBlocked } });
                }

                return true;
            } else {
                throw new Error(response.message || 'Failed to toggle block status');
            }
        } catch (error: any) {
            console.error('❌ Failed to toggle block status:', error);

            // Revert optimistic update
            set({
                users: originalUsers,
                selectedUser: originalSelected,
                error: error.response?.data?.message || error.message || 'Failed to toggle block status',
                isUpdating: false,
            });
            return false;
        }
    },

    // Toggle active status
    toggleActiveStatus: async (id: number) => {
        set({ isUpdating: true, error: null });

        // Optimistic update
        const state = get();
        const originalUsers = state.users;
        const originalSelected = state.selectedUser;

        const updatedUsers = state.users.map(user =>
            user.id === id ? { ...user, isActive: !user.isActive } : user
        );
        set({ users: updatedUsers });

        if (state.selectedUser?.id === id) {
            set({ selectedUser: { ...state.selectedUser, isActive: !state.selectedUser.isActive } });
        }

        try {
            const response = await usersService.toggleActiveStatus(id);

            if (response.success && response.data) {
                set({ isUpdating: false });

                // Update with server response
                const updatedUsers = state.users.map(user =>
                    user.id === id ? { ...user, isActive: response.data!.isActive } : user
                );
                set({ users: updatedUsers });

                if (state.selectedUser?.id === id) {
                    set({ selectedUser: { ...state.selectedUser, isActive: response.data!.isActive } });
                }

                return true;
            } else {
                throw new Error(response.message || 'Failed to toggle active status');
            }
        } catch (error: any) {
            console.error('❌ Failed to toggle active status:', error);

            // Revert optimistic update
            set({
                users: originalUsers,
                selectedUser: originalSelected,
                error: error.response?.data?.message || error.message || 'Failed to toggle active status',
                isUpdating: false,
            });
            return false;
        }
    },

    // Delete user
    deleteUser: async (id: number) => {
        set({ isDeleting: true, error: null });

        // Optimistic update
        const state = get();
        const originalUsers = state.users;

        const filteredUsers = state.users.filter(user => user.id !== id);
        set({ users: filteredUsers });

        try {
            const response = await usersService.deleteUser(id);

            if (response.success) {
                set({ isDeleting: false });

                // Clear selected if it was deleted
                if (state.selectedUser?.id === id) {
                    set({ selectedUser: null });
                }

                return true;
            } else {
                throw new Error(response.message || 'Failed to delete user');
            }
        } catch (error: any) {
            console.error('❌ Failed to delete user:', error);

            // Revert optimistic update
            set({
                users: originalUsers,
                error: error.response?.data?.message || error.message || 'Failed to delete user',
                isDeleting: false,
            });
            return false;
        }
    },

    // Fetch statistics
    fetchStats: async (force = false) => {
        const state = get();
        const now = Date.now();

        if (!force && state.stats && state.lastFetchTime && (now - state.lastFetchTime) < state.cacheTimeout) {
            return;
        }

        try {
            const response = await usersService.getStats();

            if (response.success && response.data) {
                set({ stats: response.data });
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch stats:', error);
        }
    },

    // Set filters and refetch
    setFilters: (filters: UserFilters) => {
        set({ filters });
        get().fetchUsers(filters, 1, true);
    },

    // Refresh users
    refreshUsers: async () => {
        set({ isRefreshing: true });
        await get().fetchUsers(get().filters, get().currentPage, true);
        set({ isRefreshing: false });
    },

    // Clear cache
    clearCache: () => {
        set({
            lastFetchTime: null,
            users: [],
            selectedUser: null,
            stats: null,
        });
    },

    // Select user
    selectUser: (id: number | null) => {
        if (id === null) {
            set({ selectedUser: null });
        } else {
            get().fetchUserById(id);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
