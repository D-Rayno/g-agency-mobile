// services/index.ts
/**
 * Central export file for all API services
 * Import services from this file for consistent usage across the application
 */

export { authService } from './auth.service';
export { bulkService } from './bulk.service';
export { eventsService } from './events.service';
export { exportsService } from './exports.service';
export { registrationsService } from './registrations.service';
export { usersService } from './users.service';

// Re-export the base API service for direct usage if needed
export { apiClient, apiService } from './api';

// Re-export types for convenience
export type * from '@/types/api';
export type * from '@/types/api-models';

