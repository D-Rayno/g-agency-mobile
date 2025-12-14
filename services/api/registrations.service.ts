// services/registrations.service.ts
import type {
    ApiResponse,
    ConfirmAttendanceRequest,
    ConfirmAttendanceResponse,
    PaginatedResponse,
    RegistrationDetails,
    RegistrationFilters,
    RegistrationStats,
    RegistrationWithRelations,
    VerifyQrCodeRequest,
    VerifyQrCodeResponse,
} from '@/types/api-models';
import { apiService } from './api';

/**
 * Registrations Service
 * Handles all registration-related API calls
 */
class RegistrationsService {
    private readonly basePath = '/admin/registrations';

    /**
     * Get paginated list of registrations with optional filters
     * @param filters - Optional filters for registrations
     * @returns Paginated list of registrations
     */
    async getRegistrations(
        filters?: RegistrationFilters
    ): Promise<ApiResponse<PaginatedResponse<RegistrationWithRelations>>> {
        return apiService.get<ApiResponse<PaginatedResponse<RegistrationWithRelations>>>(
            this.basePath,
            filters
        );
    }

    /**
     * Get detailed information about a specific registration
     * @param id - Registration ID
     * @returns Registration details
     */
    async getRegistrationById(id: number): Promise<ApiResponse<RegistrationDetails>> {
        return apiService.get<ApiResponse<RegistrationDetails>>(`${this.basePath}/${id}`);
    }

    /**
     * Verify a QR code without marking attendance
     * @param request - QR code verification request
     * @returns Verification result with registration information
     */
    async verifyQrCode(request: VerifyQrCodeRequest): Promise<ApiResponse<VerifyQrCodeResponse>> {
        return apiService.post<ApiResponse<VerifyQrCodeResponse>>(
            `${this.basePath}/verify`,
            request
        );
    }

    /**
     * Scan QR code and mark user as attended
     * @param request - Attendance confirmation request
     * @returns Confirmation result with updated registration
     */
    async confirmAttendance(
        request: ConfirmAttendanceRequest
    ): Promise<ApiResponse<ConfirmAttendanceResponse>> {
        return apiService.post<ApiResponse<ConfirmAttendanceResponse>>(
            `${this.basePath}/confirm`,
            request
        );
    }

    /**
     * Cancel a registration (admin action)
     * @param id - Registration ID
     * @returns Success response
     */
    async cancelRegistration(id: number): Promise<ApiResponse> {
        return apiService.delete<ApiResponse>(`${this.basePath}/${id}`);
    }

    /**
     * Get global statistics about registrations
     * @returns Registration statistics
     */
    async getStats(): Promise<ApiResponse<RegistrationStats>> {
        return apiService.get<ApiResponse<RegistrationStats>>(`${this.basePath}/stats`);
    }
}

export const registrationsService = new RegistrationsService();
