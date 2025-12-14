// services/events.service.ts
import type {
    ApiResponse,
    CreateEventRequest,
    Event,
    EventDetails,
    EventFilters,
    EventStats,
    PaginatedResponse,
    UpdateEventRequest,
    UploadImageResponse,
} from '@/types/api-models';
import { apiService } from './api';

/**
 * Events Service
 * Handles all event-related API calls
 */
class EventsService {
    private readonly basePath = '/admin/events';

    /**
     * Get paginated list of events with optional filters
     * @param filters - Optional filters for events
     * @returns Paginated list of events
     */
    async getEvents(filters?: EventFilters): Promise<ApiResponse<PaginatedResponse<Event>>> {
        return apiService.get<ApiResponse<PaginatedResponse<Event>>>(
            this.basePath,
            filters
        );
    }

    /**
     * Get detailed information about a specific event
     * @param id - Event ID
     * @returns Event details
     */
    async getEventById(id: number): Promise<ApiResponse<EventDetails>> {
        return apiService.get<ApiResponse<EventDetails>>(`${this.basePath}/${id}`);
    }

    /**
     * Create a new event
     * @param data - Event creation data
     * @returns Created event information
     */
    async createEvent(data: CreateEventRequest): Promise<ApiResponse<{ id: number; name: string }>> {
        return apiService.post<ApiResponse<{ id: number; name: string }>>(
            this.basePath,
            data
        );
    }

    /**
     * Update an existing event
     * @param id - Event ID
     * @param data - Event update data
     * @returns Updated event information
     */
    async updateEvent(
        id: number,
        data: UpdateEventRequest
    ): Promise<ApiResponse<{ id: number; name: string }>> {
        return apiService.put<ApiResponse<{ id: number; name: string }>>(
            `${this.basePath}/${id}`,
            data
        );
    }

    /**
     * Delete an event (only if no active registrations)
     * @param id - Event ID
     * @returns Success response
     */
    async deleteEvent(id: number): Promise<ApiResponse> {
        return apiService.delete<ApiResponse>(`${this.basePath}/${id}`);
    }

    /**
     * Get global statistics about all events
     * @returns Event statistics
     */
    async getStats(): Promise<ApiResponse<EventStats>> {
        return apiService.get<ApiResponse<EventStats>>(`${this.basePath}/stats`);
    }

    /**
     * Upload an image for an event
     * @param id - Event ID
     * @param imageFile - Image file to upload
     * @param onProgress - Optional progress callback
     * @returns Uploaded image URL
     */
    async uploadImage(
        id: number,
        imageFile: File | Blob,
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse<UploadImageResponse>> {
        const formData = new FormData();
        formData.append('image', imageFile);

        return apiService.upload<ApiResponse<UploadImageResponse>>(
            `${this.basePath}/${id}/image`,
            formData,
            onProgress
        );
    }
}

export const eventsService = new EventsService();
