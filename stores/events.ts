// stores/events.ts
import { eventsService } from '@/services/api';
import type {
    CreateEventRequest,
    Event,
    EventDetails,
    EventFilters,
    EventStats,
    UpdateEventRequest,
} from '@/types/api-models';
import { create } from 'zustand';

interface EventsState {
    // Data
    events: Event[];
    selectedEvent: EventDetails | null;
    stats: EventStats | null;

    // Pagination
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    perPage: number;

    // Filters
    filters: EventFilters;

    // UI State
    isLoading: boolean;
    isRefreshing: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;

    // Cache
    lastFetchTime: number | null;
    cacheTimeout: number; // 5 minutes

    // Actions
    fetchEvents: (filters?: EventFilters, page?: number, force?: boolean) => Promise<void>;
    fetchEventById: (id: number, force?: boolean) => Promise<void>;
    createEvent: (data: CreateEventRequest) => Promise<number | null>;
    updateEvent: (id: number, data: UpdateEventRequest) => Promise<boolean>;
    deleteEvent: (id: number) => Promise<boolean>;
    uploadEventImage: (id: number, imageFile: File | Blob, onProgress?: (progress: number) => void) => Promise<string | null>;
    fetchStats: (force?: boolean) => Promise<void>;
    setFilters: (filters: EventFilters) => void;
    refreshEvents: () => Promise<void>;
    clearCache: () => void;
    selectEvent: (id: number | null) => void;
    clearError: () => void;
}

export const useEventsStore = create<EventsState>()((set, get) => ({
    // Initial state
    events: [],
    selectedEvent: null,
    stats: null,

    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    perPage: 12,

    filters: {},

    isLoading: false,
    isRefreshing: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,

    lastFetchTime: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes

    // Fetch events with caching
    fetchEvents: async (filters?: EventFilters, page = 1, force = false) => {
        const state = get();
        const now = Date.now();

        // Check cache
        const shouldFetch = force ||
            !state.lastFetchTime ||
            (now - state.lastFetchTime) > state.cacheTimeout ||
            JSON.stringify(filters) !== JSON.stringify(state.filters) ||
            page !== state.currentPage;

        if (!shouldFetch && state.events.length > 0) {
            console.log('📦 Using cached events');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await eventsService.getEvents({ ...filters, page });

            if (response.success && response.data) {
                set({
                    events: response.data.data,
                    currentPage: response.data.meta.current_page,
                    totalPages: response.data.meta.last_page,
                    totalEvents: response.data.meta.total,
                    perPage: response.data.meta.per_page,
                    filters: filters || {},
                    lastFetchTime: now,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message || 'Failed to fetch events');
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch events:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch events',
                isLoading: false,
            });
        }
    },

    // Fetch event by ID
    fetchEventById: async (id: number, force = false) => {
        const state = get();

        // Check if already selected and not forcing
        if (!force && state.selectedEvent?.id === id) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await eventsService.getEventById(id);

            if (response.success && response.data) {
                set({
                    selectedEvent: response.data,
                    isLoading: false,
                });
            } else {
                throw new Error(response.message || 'Failed to fetch event');
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch event:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to fetch event',
                isLoading: false,
            });
        }
    },

    // Create event
    createEvent: async (data: CreateEventRequest) => {
        set({ isCreating: true, error: null });

        try {
            const response = await eventsService.createEvent(data);

            if (response.success && response.data) {
                set({ isCreating: false });

                // Refresh events list
                await get().refreshEvents();

                return response.data.id;
            } else {
                throw new Error(response.message || 'Failed to create event');
            }
        } catch (error: any) {
            console.error('❌ Failed to create event:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to create event',
                isCreating: false,
            });
            return null;
        }
    },

    // Update event
    updateEvent: async (id: number, data: UpdateEventRequest) => {
        set({ isUpdating: true, error: null });

        // Optimistic update
        const state = get();
        const originalEvents = state.events;
        const originalSelected = state.selectedEvent;

        const updatedEvents = state.events.map(event =>
            event.id === id ? { ...event, ...data } : event
        );
        set({ events: updatedEvents });

        if (state.selectedEvent?.id === id) {
            set({ selectedEvent: { ...state.selectedEvent, ...data } as EventDetails });
        }

        try {
            const response = await eventsService.updateEvent(id, data);

            if (response.success) {
                set({ isUpdating: false });

                // Refresh to get server data
                await get().fetchEventById(id, true);

                return true;
            } else {
                throw new Error(response.message || 'Failed to update event');
            }
        } catch (error: any) {
            console.error('❌ Failed to update event:', error);

            // Revert optimistic update
            set({
                events: originalEvents,
                selectedEvent: originalSelected,
                error: error.response?.data?.message || error.message || 'Failed to update event',
                isUpdating: false,
            });
            return false;
        }
    },

    // Delete event
    deleteEvent: async (id: number) => {
        set({ isDeleting: true, error: null });

        // Optimistic update
        const state = get();
        const originalEvents = state.events;

        const filteredEvents = state.events.filter(event => event.id !== id);
        set({ events: filteredEvents });

        try {
            const response = await eventsService.deleteEvent(id);

            if (response.success) {
                set({ isDeleting: false });

                // Clear selected if it was deleted
                if (state.selectedEvent?.id === id) {
                    set({ selectedEvent: null });
                }

                return true;
            } else {
                throw new Error(response.message || 'Failed to delete event');
            }
        } catch (error: any) {
            console.error('❌ Failed to delete event:', error);

            // Revert optimistic update
            set({
                events: originalEvents,
                error: error.response?.data?.message || error.message || 'Failed to delete event',
                isDeleting: false,
            });
            return false;
        }
    },

    // Upload event image
    uploadEventImage: async (id: number, imageFile: File | Blob, onProgress?: (progress: number) => void) => {
        set({ isUpdating: true, error: null });

        try {
            const response = await eventsService.uploadImage(id, imageFile, onProgress);

            if (response.success && response.data) {
                set({ isUpdating: false });

                // Update event with new image URL
                const imageUrl = response.data.imageUrl;
                await get().updateEvent(id, { imageUrl });

                return imageUrl;
            } else {
                throw new Error(response.message || 'Failed to upload image');
            }
        } catch (error: any) {
            console.error('❌ Failed to upload image:', error);
            set({
                error: error.response?.data?.message || error.message || 'Failed to upload image',
                isUpdating: false,
            });
            return null;
        }
    },

    // Fetch statistics
    fetchStats: async (force = false) => {
        const state = get();
        const now = Date.now();

        // Check cache
        if (!force && state.stats && state.lastFetchTime && (now - state.lastFetchTime) < state.cacheTimeout) {
            return;
        }

        try {
            const response = await eventsService.getStats();

            if (response.success && response.data) {
                set({ stats: response.data });
            }
        } catch (error: any) {
            console.error('❌ Failed to fetch stats:', error);
        }
    },

    // Set filters and refetch
    setFilters: (filters: EventFilters) => {
        set({ filters });
        get().fetchEvents(filters, 1, true);
    },

    // Refresh events (force fetch)
    refreshEvents: async () => {
        set({ isRefreshing: true });
        await get().fetchEvents(get().filters, get().currentPage, true);
        set({ isRefreshing: false });
    },

    // Clear cache
    clearCache: () => {
        set({
            lastFetchTime: null,
            events: [],
            selectedEvent: null,
            stats: null,
        });
    },

    // Select event
    selectEvent: (id: number | null) => {
        if (id === null) {
            set({ selectedEvent: null });
        } else {
            get().fetchEventById(id);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
