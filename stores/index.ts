// stores/index.ts
/**
 * Central export file for all Zustand stores
 * Import stores from this file for consistent usage across the application
 */

export { useAdminAuth } from './admin-auth';
export { useDashboardStore } from './dashboard';
export { useEventsStore } from './events';
export { useNotificationStore } from './notification';
export { useRegistrationsStore } from './registrations';
export { useUsersStore } from './users';

