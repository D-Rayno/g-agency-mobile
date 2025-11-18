// services/event.ts - Event Service Layer
import type { ApiResponse, Event, EventFilters, PaginatedResponse } from '@/types/api';
import { apiService } from './api';

class EventService {
    private baseUrl = '/admin/events';

    // Get all events with filters
    async getEvents(filters?: EventFilters): Promise<ApiResponse<PaginatedResponse<Event>>> {
        return apiService.get<ApiResponse<PaginatedResponse<Event>>>(this.baseUrl, filters);
    }

    // Get single event
    async getEvent(id: number): Promise<ApiResponse<Event>> {
        return apiService.get<ApiResponse<Event>>(`${this.baseUrl}/${id}`);
    }

    // Create event
    async createEvent(data: Partial<Event>): Promise<ApiResponse<{ id: number; name: string }>> {
        return apiService.post<ApiResponse<{ id: number; name: string }>>(this.baseUrl, data);
    }

    // Update event
    async updateEvent(id: number, data: Partial<Event>): Promise<ApiResponse<{ id: number; name: string }>> {
        return apiService.put<ApiResponse<{ id: number; name: string }>>(`${this.baseUrl}/${id}`, data);
    }

    // Delete event
    async deleteEvent(id: number): Promise<ApiResponse> {
        return apiService.delete<ApiResponse>(`${this.baseUrl}/${id}`);
    }

    // Get event statistics
    async getStats(): Promise<ApiResponse<{
        total: number;
        upcoming: number;
        ongoing: number;
        finished: number;
    }>> {
        return apiService.get<ApiResponse<any>>(`${this.baseUrl}/stats`);
    }

    // Upload event image
    async uploadImage(id: number, file: File | Blob, onProgress?: (progress: number) => void): Promise<ApiResponse> {
        const formData = new FormData();
        formData.append('image', file as any);

        return apiService.upload<ApiResponse>(`${this.baseUrl}/${id}/image`, formData, onProgress);
    }

    // Bulk operations
    async bulkUpdate(eventIds: number[], updates: Partial<Event>): Promise<ApiResponse<{ updated: number; fields: string[] }>> {
        return apiService.put<ApiResponse<any>>('/admin/bulk/events', {
            eventIds,
            updates,
        });
    }

    async bulkDelete(eventIds: number[]): Promise<ApiResponse<{ deleted: number }>> {
        return apiService.delete<ApiResponse<any>>('/admin/bulk/events', {
            data: { eventIds },
        });
    }

    // Export
    async exportCSV(filters?: EventFilters): Promise<Blob> {
        const response = await apiService.client.get('/admin/exports/events/csv', {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }

    async exportExcel(filters?: EventFilters): Promise<Blob> {
        const response = await apiService.client.get('/admin/exports/events/excel', {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }
}

export const eventService = new EventService();