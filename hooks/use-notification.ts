// hooks/use-notification.ts - Clean, focused notification hook
import { useAuth } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { handleApiError, showAlert, showToast } from '@/utils/translation';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';

const PERMISSION_REQUEST_COOLDOWN = 86400000; // 24 hours

export const useNotification = () => {
  const { isAuthenticated, user } = useAuth();
  const store = useNotificationStore();

  const initializationAttempted = useRef(false);
  const lastPermissionRequestTime = useRef(0);
  const permissionRequestShownOnLogin = useRef(false);

  // ====================
  // INITIALIZATION
  // ====================
  useEffect(() => {
    if (
      isAuthenticated &&
      user?.id &&
      !store.isInitialized &&
      !initializationAttempted.current
    ) {
      initializationAttempted.current = true;

      console.log('Initializing notifications for user:', user.id);
      store.initialize(user.id);
    }

    // Reset on logout
    if (!isAuthenticated || !user?.id) {
      initializationAttempted.current = false;
      permissionRequestShownOnLogin.current = false;
      store.cleanup();
    }
  }, [isAuthenticated, user?.id, store.isInitialized]);

  // ====================
  // APP STATE HANDLING
  // ====================
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated && store.isInitialized) {
        // Refresh permission status when app comes to foreground
        store.checkPermissionStatus();

        // Refresh subscriptions if needed
        if (store.isSubscribed) {
          store.loadSubscriptions();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated, store.isInitialized, store.isSubscribed]);

  // ====================
  // PERMISSION MANAGEMENT
  // ====================

  /**
   * Request permissions strategically (with user-friendly dialog)
   * Used for: First-time setup, onboarding
   */
  const requestPermissionsWithDialog = useCallback(
    async (
      options: {
        titleKey?: string;
        messageKey?: string;
        skipCooldown?: boolean;
      } = {}
    ): Promise<boolean> => {
      const {
        titleKey = 'notifications.enableTitle',
        messageKey = 'notifications.enableMessage',
        skipCooldown = false,
      } = options;

      if (!user?.id || !store.isInitialized) {
        return false;
      }

      // Check cooldown (unless skipped for manual requests)
      if (!skipCooldown) {
        const now = Date.now();
        if (now - lastPermissionRequestTime.current < PERMISSION_REQUEST_COOLDOWN) {
          console.log('Permission request in cooldown period');
          return store.permissionStatus === 'granted';
        }
      }

      // Don't show dialog if already decided
      if (store.permissionStatus !== 'undetermined') {
        return store.permissionStatus === 'granted';
      }

      return new Promise<boolean>((resolve) => {
        showAlert(
          titleKey,
          messageKey,
          [
            {
              textKey: 'notifications.notNow',
              style: 'cancel',
              onPress: () => {
                lastPermissionRequestTime.current = Date.now();
                resolve(false);
              },
            },
            {
              textKey: 'notifications.enable',
              onPress: async () => {
                try {
                  const granted = await store.requestPermissions();
                  lastPermissionRequestTime.current = Date.now();

                  if (granted) {
                    showToast.success('notifications.enabledTitle', 'notifications.enabledMessage');
                  }

                  resolve(granted);
                } catch (error) {
                  handleApiError(error, 'common.error', 'notifications.testFailedMessage');
                  resolve(false);
                }
              },
            },
          ],
          { cancelable: false }
        );
      });
    },
    [user?.id, store]
  );

  /**
   * Request permissions directly (no dialog)
   * Used for: Settings toggle, direct user action
   */
  const requestPermissionsDirectly = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      showToast.error('common.error', 'auth.missingInformation');
      return false;
    }

    try {
      const granted = await store.requestPermissions();

      // If denied and user tried from settings, show how to enable
      if (!granted && store.permissionStatus === 'denied') {
        showAlert(
          'notifications.permissionDenied',
          'notifications.permissionDeniedMessage',
          [
            {
              textKey: 'notifications.openSettings',
              onPress: () => Linking.openSettings(),
            },
            { textKey: 'common.cancel' },
          ]
        );
      }

      return granted;
    } catch (error) {
      handleApiError(error, 'common.error', 'notifications.testFailedMessage');
      return false;
    }
  }, [user?.id, store]);

  /**
   * Strategic permission request on login
   * Only shows once per session, respects cooldown
   */
  const requestPermissionsOnLogin = useCallback(async (): Promise<boolean> => {
    if (permissionRequestShownOnLogin.current) {
      return store.permissionStatus === 'granted';
    }

    if (store.permissionStatus !== 'undetermined') {
      return store.permissionStatus === 'granted';
    }

    // Wait a bit after login for better UX
    await new Promise((resolve) => setTimeout(resolve, 3000));

    permissionRequestShownOnLogin.current = true;

    return requestPermissionsWithDialog({
      titleKey: 'notifications.enableTitle',
      messageKey: 'notifications.enableMessage',
    });
  }, [store.permissionStatus, requestPermissionsWithDialog]);

  // ====================
  // PREFERENCE MANAGEMENT
  // ====================

  /**
   * Toggle a specific notification category
   */
  const toggleCategory = useCallback(
    async (categoryId: string) => {
      if (store.permissionStatus !== 'granted' || !store.isSubscribed) {
        showToast.info('profile.notifications.enableFirst', 'profile.notifications.enableFirstMessage');
        return;
      }

      await store.toggleCategory(categoryId);
    },
    [store]
  );

  /**
   * Toggle push notifications on/off
   * Handles permission requests automatically
   */
  const togglePushNotifications = useCallback(
    async (enabled: boolean) => {
      if (enabled && store.permissionStatus !== 'granted') {
        // Need to request permissions first
        const granted = await requestPermissionsDirectly();
        if (!granted) {
          return;
        }
      }

      await store.togglePushNotifications();
    },
    [store, requestPermissionsDirectly]
  );

  /**
   * Toggle email notifications
   */
  const toggleEmailNotifications = useCallback(async () => {
    await store.toggleEmailNotifications();
  }, [store]);

  // ====================
  // TESTING & UTILITIES
  // ====================

  /**
   * Send a test notification
   */
  const sendTestNotification = useCallback(async () => {
    if (!store.isSubscribed) {
      showToast.error('notifications.testFailed', 'notifications.notSubscribed');
      return false;
    }

    try {
      const success = await store.sendTestNotification();

      if (success) {
        showToast.success('notifications.testSent', 'notifications.testSentMessage');
      } else {
        showToast.error('notifications.testFailed', 'notifications.testFailedMessage');
      }

      return success;
    } catch (error) {
      handleApiError(error, 'common.error', 'notifications.testFailedMessage');
      return false;
    }
  }, [store]);

  /**
   * Get user-friendly status information
   */
  const getStatusInfo = useCallback(() => {
    const isFullyEnabled = store.permissionStatus === 'granted' && store.isSubscribed;
    const status = isFullyEnabled
      ? 'enabled'
      : store.permissionStatus === 'granted'
      ? 'disabled'
      : store.permissionStatus;

    return {
      status,
      messageKey: isFullyEnabled
        ? 'notifications.enabledMessage'
        : store.permissionStatus === 'denied'
        ? 'notifications.disabledMessage'
        : 'notifications.enableMessage',
      canEnable: store.permissionStatus !== 'granted',
      canTest: isFullyEnabled,
      isReady: store.isInitialized,
    };
  }, [store.isInitialized, store.permissionStatus, store.isSubscribed]);

  // ====================
  // RETURN PUBLIC API
  // ====================
  return {
    // State
    isInitialized: store.isInitialized,
    permissionStatus: store.permissionStatus,
    isSubscribed: store.isSubscribed,
    isLoading: store.isLoading,
    isSyncing: store.isSyncing,
    error: store.error,

    // Preferences
    categories: store.categories,
    emailNotificationsEnabled: store.emailNotificationsEnabled,
    pushNotificationsEnabled: store.pushNotificationsEnabled,

    // Data
    subscriptions: store.subscriptions,
    notificationHistory: store.notificationHistory,
    unreadCount: store.unreadCount,

    // Permission Actions
    requestPermissionsOnLogin,
    requestPermissionsDirectly,
    requestPermissionsWithDialog,

    // Preference Actions
    toggleCategory,
    togglePushNotifications,
    toggleEmailNotifications,

    // Subscription Actions
    unsubscribeById: store.unsubscribeById,
    loadSubscriptions: store.loadSubscriptions,

    // History Actions
    loadNotificationHistory: store.loadNotificationHistory,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    clearAllNotifications: store.clearAllNotifications,

    // Testing
    sendTestNotification,
    testSubscription: store.testSubscription,
    testAllSubscriptions: store.testAllSubscriptions,

    // Utilities
    getStatusInfo,
    clearError: store.clearError,
    syncToServer: store.syncPreferencesToServer,
  };
};