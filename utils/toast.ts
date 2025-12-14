// utils/toast.ts - Translation Helper for Toasts
import Toast from 'react-native-toast-message';

// Helper function to get translated messages safely
// Simplified to return fallback or key since i18n is removed
const t = (key: string, fallback?: string, options?: any): string => {
  return fallback || key;
};

// Toast utilities with translations
export const ToastUtils = {
  // Generic toast methods
  success: (titleKey: string, messageKey?: string, titleFallback?: string, messageFallback?: string, options?: any) => {
    Toast.show({
      type: 'success',
      text1: t(titleKey, titleFallback, options),
      text2: messageKey ? t(messageKey, messageFallback, options) : undefined,
    });
  },

  error: (titleKey: string, messageKey?: string, titleFallback?: string, messageFallback?: string, options?: any) => {
    Toast.show({
      type: 'error',
      text1: t(titleKey, titleFallback, options),
      text2: messageKey ? t(messageKey, messageFallback, options) : undefined,
    });
  },

  info: (titleKey: string, messageKey?: string, titleFallback?: string, messageFallback?: string, options?: any) => {
    Toast.show({
      type: 'info',
      text1: t(titleKey, titleFallback, options),
      text2: messageKey ? t(messageKey, messageFallback, options) : undefined,
    });
  },

  warning: (titleKey: string, messageKey?: string, titleFallback?: string, messageFallback?: string, options?: any) => {
    Toast.show({
      type: 'warning',
      text1: t(titleKey, titleFallback, options),
      text2: messageKey ? t(messageKey, messageFallback, options) : undefined,
    });
  },

  // Pre-defined common toasts
  networkError: () => {
    Toast.show({
      type: 'error',
      text1: t('api.networkError', 'Network Error'),
      text2: t('api.networkErrorMessage', 'Please check your internet connection and try again.'),
    });
  },

  serverError: () => {
    Toast.show({
      type: 'error',
      text1: t('api.serverError', 'Server Error'),
      text2: t('api.serverErrorMessage', 'The server is not responding. Please try again later.'),
    });
  },

  sessionExpired: () => {
    Toast.show({
      type: 'error',
      text1: t('api.sessionExpired', 'Session Expired'),
      text2: t('api.sessionExpiredMessage', 'You have been logged out. Please sign in again.'),
    });
  },

  unauthorized: () => {
    Toast.show({
      type: 'error',
      text1: t('api.unauthorized', 'Unauthorized'),
      text2: t('api.unauthorizedMessage', 'Please log in to continue.'),
    });
  },

  forbidden: () => {
    Toast.show({
      type: 'error',
      text1: t('api.forbidden', 'Forbidden'),
      text2: t('api.forbiddenMessage', "You don't have permission to access this."),
    });
  },

  validationError: (customMessage?: string) => {
    Toast.show({
      type: 'error',
      text1: t('api.validationError', 'Validation Error'),
      text2: customMessage || t('api.validationErrorMessage', 'Please check your input.'),
    });
  },

  // Legacy project specific toasts
  legacyProject: {
    loadSuccess: (count: number) => {
      Toast.show({
        type: 'success',
        text1: t('api.success', 'Success'),
        text2: t('legacyProjects.projectsCount', `Loaded ${count} projects`, { count }),
      });
    },

    loadError: () => {
      Toast.show({
        type: 'error',
        text1: t('legacyProjects.errorTitle', 'Unable to Load Projects'),
        text2: t('api.errorMessage', 'An unexpected error occurred. Please try again.'),
      });
    },

    detailLoadError: () => {
      Toast.show({
        type: 'error',
        text1: t('legacyProjects.errorTitle', 'Unable to Load Project Details'),
        text2: t('api.errorMessage', 'Failed to load project details. Please try again.'),
      });
    },

    filterLoadError: () => {
      Toast.show({
        type: 'error',
        text1: t('common.error', 'Error'),
        text2: t('legacyProjects.loadingFilters', 'Failed to load filter options.'),
      });
    },
  },

  // Profile related toasts
  profile: {
    updateSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('profile.profileUpdated', 'Profile Updated'),
        text2: t('profile.profileUpdated', 'Your profile has been updated successfully.'),
      });
    },

    updateError: () => {
      Toast.show({
        type: 'error',
        text1: t('profile.profileUpdateFailed', 'Profile Update Failed'),
        text2: t('api.errorMessage', 'Failed to update your profile. Please try again.'),
      });
    },
  },

  // Auth related toasts
  auth: {
    loginSuccess: (name?: string) => {
      Toast.show({
        type: 'success',
        text1: t('auth.welcome', 'Welcome'),
        text2: name
          ? t('home.welcome', `Welcome back, ${name}!`, { name })
          : t('home.welcomeUser', 'Welcome back!'),
      });
    },

    logoutSuccess: () => {
      Toast.show({
        type: 'info',
        text1: t('auth.logout', 'Logged Out'),
        text2: t('auth.logout', 'You have been logged out successfully.'),
      });
    },

    passwordChangeSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('profile.changePassword.success', 'Password Changed'),
        text2: t('profile.changePassword.successMessage', 'Your password has been changed successfully!'),
      });
    },
  },
};

export default ToastUtils;