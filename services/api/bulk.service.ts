// services/bulk.service.ts
import type {
    ApiResponse,
    BulkCancelRegistrationsRequest,
    BulkDeleteEventsRequest,
    BulkDeleteRegistrationsRequest,
    BulkDeleteUsersRequest,
    BulkOperationResponse,
    BulkUpdateEventsRequest,
    BulkUpdateUsersRequest,
} from '@/types/api-models';
import { apiService } from './api';

/**
 * Bulk Operations Service
 * Handles all bulk operation API calls for events, users, and registrations
 */
class BulkService {
    private readonly basePath = '/admin/bulk';

    // ============================================================================
    // EVENTS BULK OPERATIONS
    // ============================================================================

    /**
     * Update multiple events at once
     * @param request - Bulk update request with event IDs and updates
     * @returns Number of events updated
     */
    async updateEvents(
        request: BulkUpdateEventsRequest
    ): Promise<ApiResponse<BulkOperationResponse>> {
        return apiService.put<ApiResponse<BulkOperationResponse>>(
            `${this.basePath}/events`,
            request
        );
    }

    /**
     * Delete multiple events at once (only events without active registrations)
     * @param request - Bulk delete request with event IDs
     * @returns Number of events deleted, skipped, and errors
     */
    async deleteEvents(
        request: BulkDeleteEventsRequest
    ): Promise<ApiResponse<BulkOperationResponse>> {
        return apiService.delete<ApiResponse<BulkOperationResponse>>(
            `${this.basePath}/events`,
            { data: request }
        );
    }

    // ============================================================================
    // USERS BULK OPERATIONS
    // ============================================================================

    /**
     * Update multiple users at once
     * @param request - Bulk update request with user IDs and updates
     * @returns Number of users updated
     */
    async updateUsers(
        request: BulkUpdateUsersRequest
    ): Promise<ApiResponse<BulkOperationResponse>> {
        return apiService.put<ApiResponse<BulkOperationResponse>>(
            `${this.basePath}/users`,
            request
        );
    }

    /**
     * Delete multiple users at once (only users without active registrations)
     * @param request - Bulk delete request with user IDs
     * @returns Number of users deleted, skipped, and errors
     */
    async deleteUsers(
        request: BulkDeleteUsersRequest
    ): Promise<ApiResponse<BulkOperationResponse>> {
        return apiService.delete<ApiResponse<BulkOperationResponse>>(
            `${this.basePath}/users`,
            { data: request }
        );
    }

    // ============================================================================
    // REGISTRATIONS BULK OPERATIONS
    // ============================================================================

    /**
     * Cancel multiple registrations at once
     * @param request - Bulk cancel request with registration IDs
     * @returns Number of registrations canceled, skipped, and errors
     */
    async cancelRegistrations(
        request: BulkCancelRegistrationsRequest
    ): Promise<ApiResponse<BulkOperationResponse>> {
        return apiService.post<ApiResponse<BulkOperationResponse>>(
            `${this.basePath}/registrations/cancel`,
            request
        );
    }

    /**
     * Delete multiple registrations at once
     * @param request - Bulk delete request with registration IDs
     * @returns Number of registrations deleted
     */
    async deleteRegistrations(
        request: BulkDeleteRegistrationsRequest
    ): Promise<ApiResponse<BulkOperationResponse>> {
        return apiService.delete<ApiResponse<BulkOperationResponse>>(
            `${this.basePath}/registrations`,
            { data: request }
        );
    }
}

export const bulkService = new BulkService();
