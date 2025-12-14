// services/users.service.ts
import type {
    ApiResponse,
    PaginatedResponse,
    UserDetails,
    UserFilters,
    UserStats,
    UserWithStats,
} from '@/types/api-models';
import { apiService } from './api';

/**
 * Users Service
 * Handles all user-related API calls
 */
class UsersService {
    private readonly basePath = '/admin/users';

    /**
     * Get paginated list of users with optional filters
     * @param filters - Optional filters for users
     * @returns Paginated list of users
     */
    async getUsers(filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<UserWithStats>>> {
        return apiService.get<ApiResponse<PaginatedResponse<UserWithStats>>>(
            this.basePath,
            filters
        );
    }

    /**
     * Get detailed information about a specific user
     * @param id - User ID
     * @returns User details with registration history
     */
    async getUserById(id: number): Promise<ApiResponse<UserDetails>> {
        return apiService.get<ApiResponse<UserDetails>>(`${this.basePath}/${id}`);
    }

    /**
     * Toggle user block status (block/unblock)
     * @param id - User ID
     * @returns Updated user block status
     */
    async toggleBlockStatus(id: number): Promise<ApiResponse<{ id: number; isBlocked: boolean }>> {
        return apiService.patch<ApiResponse<{ id: number; isBlocked: boolean }>>(
            `${this.basePath}/${id}/toggle-block`
        );
    }

    /**
     * Toggle user active status (activate/deactivate)
     * @param id - User ID
     * @returns Updated user active status
     */
    async toggleActiveStatus(id: number): Promise<ApiResponse<{ id: number; isActive: boolean }>> {
        return apiService.patch<ApiResponse<{ id: number; isActive: boolean }>>(
            `${this.basePath}/${id}/toggle-active`
        );
    }

    /**
     * Delete a user (only if no active registrations)
     * @param id - User ID
     * @returns Success response
     */
    async deleteUser(id: number): Promise<ApiResponse> {
        return apiService.delete<ApiResponse>(`${this.basePath}/${id}`);
    }

    /**
     * Get global statistics about users
     * @returns User statistics
     */
    async getStats(): Promise<ApiResponse<UserStats>> {
        return apiService.get<ApiResponse<UserStats>>(`${this.basePath}/stats`);
    }
}

export const usersService = new UsersService();
