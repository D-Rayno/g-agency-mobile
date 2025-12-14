// stores/registrations.ts
import { registrationsService } from '@/services/api';
import type {
    ConfirmAttendanceResponse,
    RegistrationDetails,
    RegistrationFilters,
    RegistrationStats,
    RegistrationWithRelations,
    VerifyQrCodeResponse
} from '@/types/api-models';
import { create } from 'zustand';

interface RegistrationsState {
    // Data
    registrations: RegistrationWithRelations[];
    selectedRegistration: RegistrationDetails | null;
    stats: RegistrationStats | null;

    // QR Scanning
    scannedQrCode: string | null;
    verificationResult: VerifyQrCodeResponse | null;
    isScanning: boolean;

    // Pagination
    currentPage: number;
    totalPages: number;
    totalRegistrations: number;
    perPage: number;

    // Filters
    filters: RegistrationFilters;

    // UI State
    isLoading: boolean;
    isRefreshing: boolean;
    isVerifying: boolean;
    isConfirming: boolean;
    isCanceling: boolean;
    error: string | null;

    // Cache
    lastFetchTime: number | null;
    cacheTimeout: number; // 3 minutes (shorter for real-time data)

    // Actions
    fetchRegistrations: (filters?: RegistrationFilters, page?: number, force?: boolean) => Promise<void>;
    fetchRegistrationById: (id: number, force?: boolean) => Promise<void>;
    verifyQrCode: (qrCode: string) => Promise<VerifyQrCodeResponse | null>;
    confirmAttendance: (qrCode: string) => Promise<ConfirmAttendanceResponse | null>;
    cancelRegistration: (id: number) => Promise<boolean>;
    fetchStats: (force?: boolean) => Promise<void>;
    setFilters: (filters: RegistrationFilters) => void;
    refreshRegistrations: () => Promise<void>;
    clearQrScan: () => void;
    clearCache: () => void;
    selectRegistration: (id: number | null) => void;
    clearError: () => void;
}

export const useRegistrationsStore = create<RegistrationsState>()((set, get) => ({
    // Initial state
    registrations: [],
    selectedRegistration: null,
    stats: null,

    scannedQrCode: null,
    verificationResult: null,
    isScanning: false,

    currentPage: 1,
    totalPages: 1,
    totalRegistrations: 0,
    perPage: 50,

    filters: {},

    isLoading: false,
    isRefreshing: false,
    isVerifying: false,
    isConfirming: false,
    isCanceling: false,
    error: null,

    lastFetchTime: null,
    cacheTimeout: 3 * 60 * 1000, // 3 minutes

    // Fetch registrations with caching
    fetchRegistrations: async (filters?: RegistrationFilters, page = 1, force = false) => {
        const state = get();
        const now = Date.now();

        // Check cache
        const shouldFetch = force ||
            !state.lastFetchTime ||
            (now - state.lastFetchTime) > state.cacheTimeout ||
            JSON.stringify(filters) !== JSON.stringify(state.filters) ||
            page !== state.currentPage;

        if (!shouldFetch && state.registrations.length > 0) {
            console.log('📦 Using cached registrations');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await registrationsService.getRegistrations({ ...filters, page });

            if (response.success && response.data) {
                set({
                    registrations: response.data.data,
                    currentPage: response.data.meta.current_page,
                    totalPages: response.data.meta.last_page,
                    totalRegistrations: response.data.meta.total,
                    perPage: response.data.meta.per_page,
                    filters: filters || {},
                    lastFetchTime: now,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message || 'Failed to fetch registrations');
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch registrations:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch registrations',
                isLoading: false,
            });
        }
    },

    // Fetch registration by ID
    fetchRegistrationById: async (id: number, force = false) => {
        const state = get();

        if (!force && state.selectedRegistration?.id === id) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await registrationsService.getRegistrationById(id);

            if (response.success && response.data) {
                set({
                    selectedRegistration: response.data,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message || 'Failed to fetch registration');
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch registration:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch registration',
                isLoading: false,
            });
        }
    },

    // Verify QR code (step 1: check validity)
    verifyQrCode: async (qrCode: string) => {
        set({ isVerifying: true, error: null, scannedQrCode: qrCode });

        try {
            const response = await registrationsService.verifyQrCode({ qrCode });

            if (response.success && response.data) {
                set({
                    verificationResult: response.data,
                    isVerifying: false,
                });
                return response.data;
            } else {
                throw new Error(response.message || 'Invalid QR code');
            }
        } catch (error: any) {
            console.error('❌ QR verification failed:', error);
            set({
                error: error.response?.data?.message || error.message || 'Invalid QR code',
                isVerifying: false,
                verificationResult: null,
            });
            return null;
        }
    },

    // Confirm attendance (step 2: mark as attended)
    confirmAttendance: async (qrCode: string) => {
        set({ isConfirming: true, error: null });

        try {
            const response = await registrationsService.confirmAttendance({ qrCode });

            if (response.success && response.data) {
                set({
                    isConfirming: false,
                    scannedQrCode: null,
                    verificationResult: null,
                });

                // Refresh registrations to show updated status
                await get().refreshRegistrations();

                return response.data;
            } else {
                throw new Error(response.message || 'Failed to confirm attendance');
            }
        } catch (error: any) {
            console.error('❌ Attendance confirmation failed:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to confirm attendance',
                isConfirming: false,
            });
            return null;
        }
    },

    // Cancel registration
    cancelRegistration: async (id: number) => {
        set({ isCanceling: true, error: null });

        // Optimistic update
        const state = get();
        const originalRegistrations = state.registrations;

        const updatedRegistrations = state.registrations.map(reg =>
            reg.id === id ? { ...reg, status: 'canceled' as const } : reg
        );
        set({ registrations: updatedRegistrations });

        try {
            const response = await registrationsService.cancelRegistration(id);

            if (response.success) {
                set({ isCanceling: false });

                // Refresh to get server data
                await get().refreshRegistrations();

                return true;
            } else {
                throw new Error(response.message || 'Failed to cancel registration');
            }
        } catch (error: any) {
            console.error('❌ Failed to cancel registration:', error);

            // Revert optimistic update
            set({
                registrations: originalRegistrations,
                error: error.response?.data?.message || error.message || 'Failed to cancel registration',
                isCanceling: false,
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
            const response = await registrationsService.getStats();

            if (response.success && response.data) {
                set({ stats: response.data });
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch stats:', error);
        }
    },

    // Set filters and refetch
    setFilters: (filters: RegistrationFilters) => {
        set({ filters });
        get().fetchRegistrations(filters, 1, true);
    },

    // Refresh registrations
    refreshRegistrations: async () => {
        set({ isRefreshing: true });
        await get().fetchRegistrations(get().filters, get().currentPage, true);
        set({ isRefreshing: false });
    },

    // Clear QR scan state
    clearQrScan: () => {
        set({
            scannedQrCode: null,
            verificationResult: null,
            isScanning: false,
            error: null,
        });
    },

    // Clear cache
    clearCache: () => {
        set({
            lastFetchTime: null,
            registrations: [],
            selectedRegistration: null,
            stats: null,
        });
    },

    // Select registration
    selectRegistration: (id: number | null) => {
        if (id === null) {
            set({ selectedRegistration: null });
        } else {
            get().fetchRegistrationById(id);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
