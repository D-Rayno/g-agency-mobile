// stores/dashboard.ts
import { authService, eventsService, registrationsService, usersService } from '@/services/api';
import type {
    AuthStats,
    Event,
    EventStats,
    RegistrationStats,
    RegistrationWithRelations,
    UserStats,
    UserWithStats,
} from '@/types/api-models';
import { create } from 'zustand';

interface DashboardState {
    // Aggregated Stats
    eventStats: EventStats | null;
    userStats: UserStats | null;
    registrationStats: RegistrationStats | null;
    authStats: AuthStats | null;

    // Recent Activity
    recentEvents: Event[];
    recentRegistrations: RegistrationWithRelations[];
    recentUsers: UserWithStats[];

    // UI State
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastRefreshTime: number | null;

    // Actions
    fetchAllStats: () => Promise<void>;
    fetchRecentActivity: () => Promise<void>;
    refreshDashboard: () => Promise<void>;
    clearError: () => void;
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
    // Initial state
    eventStats: null,
    userStats: null,
    registrationStats: null,
    authStats: null,

    recentEvents: [],
    recentRegistrations: [],
    recentUsers: [],

    isLoading: false,
    isRefreshing: false,
    error: null,
    lastRefreshTime: null,

    // Fetch all statistics in parallel
    fetchAllStats: async () => {
        set({ isLoading: true, error: null });

        try {
            const [eventStatsRes, userStatsRes, registrationStatsRes, authStatsRes] = await Promise.allSettled([
                eventsService.getStats(),
                usersService.getStats(),
                registrationsService.getStats(),
                authService.getStats(),
            ]);

            set({
                eventStats: eventStatsRes.status === 'fulfilled' && eventStatsRes.value.success
                    ? eventStatsRes.value.data || null
                    : null,
                userStats: userStatsRes.status === 'fulfilled' && userStatsRes.value.success
                    ? userStatsRes.value.data || null
                    : null,
                registrationStats: registrationStatsRes.status === 'fulfilled' && registrationStatsRes.value.success
                    ? registrationStatsRes.value.data || null
                    : null,
                authStats: authStatsRes.status === 'fulfilled' && authStatsRes.value.success
                    ? authStatsRes.value.data || null
                    : null,
                isLoading: false,
                lastRefreshTime: Date.now(),
            });
        } catch (error: any) {
            console.error('❌ Failed to fetch dashboard stats:', error);
            set({
                error: error.message || 'Failed to fetch dashboard statistics',
                isLoading: false,
            });
        }
    },

    // Fetch recent activity
    fetchRecentActivity: async () => {
        try {
            const [eventsRes, registrationsRes, usersRes] = await Promise.allSettled([
                eventsService.getEvents({ page: 1 }),
                registrationsService.getRegistrations({ page: 1, limit: 10 }),
                usersService.getUsers({ page: 1, limit: 10 }),
            ]);

            set({
                recentEvents: eventsRes.status === 'fulfilled' && eventsRes.value.success
                    ? eventsRes.value.data?.data.slice(0, 5) || []
                    : [],
                recentRegistrations: registrationsRes.status === 'fulfilled' && registrationsRes.value.success
                    ? registrationsRes.value.data?.data.slice(0, 10) || []
                    : [],
                recentUsers: usersRes.status === 'fulfilled' && usersRes.value.success
                    ? usersRes.value.data?.data.slice(0, 10) || []
                    : [],
            });
        } catch (error: any) {
            console.error('❌ Failed to fetch recent activity:', error);
        }
    },

    // Refresh entire dashboard
    refreshDashboard: async () => {
        set({ isRefreshing: true, error: null });

        await Promise.all([
            get().fetchAllStats(),
            get().fetchRecentActivity(),
        ]);

        set({ isRefreshing: false });
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
