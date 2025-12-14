// services/exports.service.ts
import type { ExportFilters, ExportFormat } from '@/types/api-models';
import { apiService } from './api';

/**
 * Exports Service
 * Handles all export-related API calls for downloading data in CSV or Excel format
 */
class ExportsService {
    private readonly basePath = '/admin/exports';

    /**
     * Download file from blob response
     * @param blob - File blob
     * @param filename - Filename for download
     */
    private downloadFile(blob: Blob, filename: string): void {
        // For React Native, you would handle this differently
        // This is a placeholder for web-based download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Get filename from content-disposition header
     * @param contentDisposition - Content-Disposition header value
     * @returns Extracted filename or default
     */
    private getFilenameFromHeader(contentDisposition: string | null): string {
        if (!contentDisposition) {
            return `export_${new Date().toISOString().split('T')[0]}.csv`;
        }
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        return matches && matches[1] ? matches[1].replace(/['"]/g, '') : `export_${new Date().toISOString().split('T')[0]}.csv`;
    }

    // ============================================================================
    // EVENTS EXPORTS
    // ============================================================================

    /**
     * Export events to CSV
     * @param filters - Optional filters to apply
     * @returns CSV file blob
     */
    async exportEventsToCsv(filters?: ExportFilters): Promise<Blob> {
        const response = await apiService.client.get(`${this.basePath}/events/csv`, {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Export events to Excel
     * @param filters - Optional filters to apply
     * @returns Excel file blob
     */
    async exportEventsToExcel(filters?: ExportFilters): Promise<Blob> {
        const response = await apiService.client.get(`${this.basePath}/events/excel`, {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Export and download events
     * @param format - Export format (csv or excel)
     * @param filters - Optional filters to apply
     */
    async downloadEvents(format: ExportFormat, filters?: ExportFilters): Promise<void> {
        const blob = format === 'csv'
            ? await this.exportEventsToCsv(filters)
            : await this.exportEventsToExcel(filters);

        const filename = `events_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        this.downloadFile(blob, filename);
    }

    // ============================================================================
    // USERS EXPORTS
    // ============================================================================

    /**
     * Export users to CSV
     * @param filters - Optional filters to apply
     * @returns CSV file blob
     */
    async exportUsersToCsv(filters?: ExportFilters): Promise<Blob> {
        const response = await apiService.client.get(`${this.basePath}/users/csv`, {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Export users to Excel
     * @param filters - Optional filters to apply
     * @returns Excel file blob
     */
    async exportUsersToExcel(filters?: ExportFilters): Promise<Blob> {
        const response = await apiService.client.get(`${this.basePath}/users/excel`, {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Export and download users
     * @param format - Export format (csv or excel)
     * @param filters - Optional filters to apply
     */
    async downloadUsers(format: ExportFormat, filters?: ExportFilters): Promise<void> {
        const blob = format === 'csv'
            ? await this.exportUsersToCsv(filters)
            : await this.exportUsersToExcel(filters);

        const filename = `users_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        this.downloadFile(blob, filename);
    }

    // ============================================================================
    // REGISTRATIONS EXPORTS
    // ============================================================================

    /**
     * Export registrations to CSV
     * @param filters - Optional filters to apply
     * @returns CSV file blob
     */
    async exportRegistrationsToCsv(filters?: ExportFilters): Promise<Blob> {
        const response = await apiService.client.get(`${this.basePath}/registrations/csv`, {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Export registrations to Excel
     * @param filters - Optional filters to apply
     * @returns Excel file blob
     */
    async exportRegistrationsToExcel(filters?: ExportFilters): Promise<Blob> {
        const response = await apiService.client.get(`${this.basePath}/registrations/excel`, {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Export and download registrations
     * @param format - Export format (csv or excel)
     * @param filters - Optional filters to apply
     */
    async downloadRegistrations(format: ExportFormat, filters?: ExportFilters): Promise<void> {
        const blob = format === 'csv'
            ? await this.exportRegistrationsToCsv(filters)
            : await this.exportRegistrationsToExcel(filters);

        const filename = `registrations_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        this.downloadFile(blob, filename);
    }
}

export const exportsService = new ExportsService();
