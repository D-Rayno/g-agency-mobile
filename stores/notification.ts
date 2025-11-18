// stores/notification.ts - Clean, production-ready notification store
import { PushNotificationService } from "@/services/notification";
import {
  NOTIFICATION_CATEGORIES,
  NotificationHistory,
  SubscriptionInfo,
} from "@/types/notification";
import { SecureStorage } from "@/utils/secure-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotificationCategoryState {
  id: string;
  enabled: boolean;
}

interface NotificationState {
  // Permission & Subscription
  permissionStatus: "granted" | "denied" | "undetermined";
  isSubscribed: boolean;

  // User Preferences (synced with backend)
  categories: NotificationCategoryState[];
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;

  // Data
  subscriptions: SubscriptionInfo[];
  notificationHistory: NotificationHistory[];
  unreadCount: number;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Session (not persisted)
  isInitialized: boolean;
  currentUserId: string | null;
  isSyncing: boolean;
  lastSyncTime: number | null;

  // Core Actions
  initialize: (userId: string) => Promise<void>;
  cleanup: () => void;

  // Permission Management
  requestPermissions: () => Promise<boolean>;
  checkPermissionStatus: () => Promise<void>;

  // Subscription Management
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  unsubscribeById: (subscriptionId: string) => Promise<boolean>;
  loadSubscriptions: () => Promise<void>;

  // Preferences (with auto-sync)
  toggleCategory: (categoryId: string) => Promise<void>;
  toggleEmailNotifications: () => Promise<void>;
  togglePushNotifications: () => Promise<void>;
  syncPreferencesToServer: () => Promise<boolean>;
  loadPreferencesFromServer: () => Promise<void>;

  // History & Notifications
  loadNotificationHistory: (refresh?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Testing & Utilities
  sendTestNotification: () => Promise<boolean>;
  testSubscription: (subscriptionId: string) => Promise<boolean>;
  testAllSubscriptions: () => Promise<boolean>;
  clearError: () => void;
}

const SYNC_DEBOUNCE_MS = 2000;

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => {
      const service = PushNotificationService.getInstance();
      let syncTimeoutId: NodeJS.Timeout | null = null;

      // Debounced sync to prevent excessive API calls
      const debouncedSync = () => {
        if (syncTimeoutId) clearTimeout(syncTimeoutId);

        syncTimeoutId = setTimeout(async () => {
          await get().syncPreferencesToServer();
        }, SYNC_DEBOUNCE_MS);
      };

      return {
        // Initial State
        permissionStatus: "undetermined",
        isSubscribed: false,
        categories: Object.values(NOTIFICATION_CATEGORIES).map((cat) => ({
          id: cat.id,
          enabled: cat.defaultEnabled,
        })),
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: false,
        subscriptions: [],
        notificationHistory: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
        isInitialized: false,
        currentUserId: null,
        isSyncing: false,
        lastSyncTime: null,

        // ====================
        // INITIALIZATION
        // ====================
        initialize: async (userId: string) => {
          const state = get();

          // Prevent re-initialization
          if (state.isInitialized && state.currentUserId === userId) {
            console.log("✅ Already initialized for user:", userId);
            return;
          }

          console.log("🚀 Initializing notifications for user:", userId);
          set({ isLoading: true, error: null, currentUserId: userId });

          try {
            // 1. Initialize service
            const initialized = await service.initialize();
            if (!initialized) {
              throw new Error("Service initialization failed");
            }

            // 2. Check permission status
            const permissionStatus = await service.getPermissionStatus();

            // 3. Load server preferences (these are the source of truth)
            await get().loadPreferencesFromServer();

            // 4. Check subscription status
            const isSubscribed = await service.isSubscribed();

            // 5. Load data in parallel
            await Promise.allSettled([
              get().loadSubscriptions(),
              get().loadNotificationHistory(),
            ]);

            set({
              permissionStatus,
              isSubscribed,
              isInitialized: true,
              isLoading: false,
            });

            console.log("✅ Notification initialization complete");
          } catch (error: any) {
            console.error("❌ Initialization failed:", error);
            set({
              error: "Failed to initialize notifications",
              isLoading: false,
              isInitialized: true,
            });
          }
        },

        cleanup: () => {
          console.log("🧹 Cleaning up notification store");
          if (syncTimeoutId) clearTimeout(syncTimeoutId);

          service.cleanup();

          set({
            isInitialized: false,
            currentUserId: null,
            isLoading: false,
            isSyncing: false,
            error: null,
            lastSyncTime: null,
          });
        },

        // ====================
        // PERMISSION MANAGEMENT
        // ====================
        requestPermissions: async () => {
          console.log("📋 Requesting permissions");
          set({ isLoading: true, error: null });

          try {
            const result = await service.requestPermissions();

            if (result.granted) {
              set({
                permissionStatus: "granted",
                isLoading: false,
              });

              // If user had push enabled, auto-subscribe
              const state = get();
              if (state.pushNotificationsEnabled) {
                await get().subscribe();
              }

              return true;
            } else {
              set({
                permissionStatus: "denied",
                error: result.error || "Permissions denied",
                isLoading: false,
              });
              return false;
            }
          } catch (error: any) {
            console.error("❌ Permission request failed:", error);
            set({
              error: "Failed to request permissions",
              isLoading: false,
            });
            return false;
          }
        },

        checkPermissionStatus: async () => {
          try {
            const status = await service.getPermissionStatus();
            set({ permissionStatus: status });
          } catch (error) {
            console.error("Failed to check permission status:", error);
          }
        },

        // ====================
        // SUBSCRIPTION MANAGEMENT
        // ====================
        subscribe: async () => {
          console.log("📤 Subscribing to notifications");
          const state = get();

          if (state.permissionStatus !== "granted") {
            set({ error: "Permissions required to subscribe" });
            return false;
          }

          set({ isLoading: true, error: null });

          try {
            const enabledCategories = state.categories
              .filter((cat) => cat.enabled)
              .map((cat) => cat.id);

            const result = await service.subscribe({
              categories: enabledCategories,
            });

            if (result.success) {
              set({
                isSubscribed: true,
                pushNotificationsEnabled: true,
                isLoading: false,
              });

              await get().loadSubscriptions();
              await get().syncPreferencesToServer();

              return true;
            } else {
              throw new Error(result.error || "Subscription failed");
            }
          } catch (error: any) {
            console.error("❌ Subscription failed:", error);
            set({
              error: "Failed to subscribe to notifications",
              isLoading: false,
            });
            return false;
          }
        },

        unsubscribe: async () => {
          console.log("📥 Unsubscribing from notifications");
          set({ isLoading: true, error: null });

          try {
            const success = await service.unsubscribe();

            if (success) {
              set({
                isSubscribed: false,
                pushNotificationsEnabled: false,
                subscriptions: [],
                isLoading: false,
              });

              await get().syncPreferencesToServer();
              return true;
            } else {
              throw new Error("Unsubscribe failed");
            }
          } catch (error: any) {
            console.error("❌ Unsubscribe failed:", error);
            set({
              error: "Failed to unsubscribe",
              isLoading: false,
            });
            return false;
          }
        },

        unsubscribeById: async (subscriptionId: string) => {
          console.log(`📥 Unsubscribing device with ID: ${subscriptionId}`);
          set({ isLoading: true, error: null });

          try {
            const success = await service.unsubscribeById(subscriptionId);

            if (success) {
              await get().loadSubscriptions();

              const state = get();
              const hasActiveSubscriptions = state.subscriptions.some((sub) => sub.isActive);

              if (!hasActiveSubscriptions) {
                set({ isSubscribed: false, pushNotificationsEnabled: false });
                await get().syncPreferencesToServer();
              }

              set({ isLoading: false });
              return true;
            } else {
              throw new Error("Unsubscribe by ID failed");
            }
          } catch (error: any) {
            console.error("❌ Unsubscribe by ID failed:", error);
            set({
              error: "Failed to unsubscribe device",
              isLoading: false,
            });
            return false;
          }
        },

        loadSubscriptions: async () => {
          try {
            const subscriptions = await service.getSubscriptions();
            const hasActiveSubscriptions = subscriptions.some((sub) => sub.isActive);

            set({
              subscriptions,
              isSubscribed: hasActiveSubscriptions,
            });
          } catch (error) {
            console.error("❌ Failed to load subscriptions:", error);
            set({ error: "Failed to load subscriptions" });
          }
        },

        // ====================
        // PREFERENCES MANAGEMENT
        // ====================
        toggleCategory: async (categoryId: string) => {
          const state = get();

          // Optimistic update
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
            ),
          }));

          // If subscribed, update subscription categories
          if (state.isSubscribed) {
            const newState = get();
            const enabledCategories = newState.categories
              .filter((cat) => cat.enabled)
              .map((cat) => cat.id);

            try {
              await service.subscribe({ categories: enabledCategories });
            } catch (error) {
              console.error("Failed to update subscription categories:", error);
              // Revert on error
              set({ categories: state.categories });
            }
          }

          debouncedSync();
        },

        toggleEmailNotifications: async () => {
          set((state) => ({
            emailNotificationsEnabled: !state.emailNotificationsEnabled,
          }));
          debouncedSync();
        },

        togglePushNotifications: async () => {
          const state = get();
          const newValue = !state.pushNotificationsEnabled;

          set({ pushNotificationsEnabled: newValue });

          if (newValue) {
            // User wants to enable push
            if (state.permissionStatus === "granted") {
              await get().subscribe();
            } else {
              set({ error: "Please grant permissions first" });
            }
          } else {
            // User wants to disable push
            if (state.isSubscribed) {
              await get().unsubscribe();
            } else {
              debouncedSync();
            }
          }
        },

        syncPreferencesToServer: async () => {
          const state = get();

          if (!state.currentUserId || state.isSyncing) {
            return false;
          }

          set({ isSyncing: true });

          try {
            const result = await service.updatePreferences({
              categories: Object.fromEntries(
                state.categories.map((cat) => [cat.id, cat.enabled])
              ),
              emailNotificationsEnabled: state.emailNotificationsEnabled,
              pushNotificationsEnabled: state.pushNotificationsEnabled && state.isSubscribed,
            });

            if (result.success) {
              set({
                isSyncing: false,
                lastSyncTime: Date.now(),
                error: null,
              });
              return true;
            } else {
              throw new Error(result.error || "Sync failed");
            }
          } catch (error: any) {
            console.error("❌ Preference sync failed:", error);
            set({
              error: "Failed to sync preferences",
              isSyncing: false,
            });
            return false;
          }
        },

        loadPreferencesFromServer: async () => {
          try {
            const result = await service.getPreferences();

            if (result.success && result.data) {
              set((state) => ({
                emailNotificationsEnabled: result.data!.emailNotificationsEnabled ?? state.emailNotificationsEnabled,
                pushNotificationsEnabled: result.data!.pushNotificationsEnabled ?? state.pushNotificationsEnabled,
                categories: state.categories.map((cat) => ({
                  ...cat,
                  enabled: result.data!.categories?.[cat.id] ?? cat.enabled,
                })),
              }));

              console.log("✅ Loaded preferences from server");
            }
          } catch (error) {
            console.log("No server preferences found, using defaults");
          }
        },

        // ====================
        // HISTORY & NOTIFICATIONS
        // ====================
        loadNotificationHistory: async (refresh = false) => {
          set({ isLoading: refresh });

          try {
            const currentHistory = refresh ? [] : get().notificationHistory;
            const offset = currentHistory.length;

            const { notifications } = await service.getNotificationHistory(20, offset);

            const newHistory = refresh ? notifications : [...currentHistory, ...notifications];
            const unreadCount = newHistory.filter((n) => !n.isRead).length;

            set({
              notificationHistory: newHistory,
              unreadCount,
              isLoading: false,
            });
          } catch (error) {
            console.error("❌ Failed to load history:", error);
            set({
              error: "Failed to load notification history",
              isLoading: false,
            });
          }
        },

        markAsRead: async (notificationId: string) => {
          set((state) => ({
            notificationHistory: state.notificationHistory.map((notif) =>
              notif.id?.toString() === notificationId || notif.uuid === notificationId
                ? { ...notif, isRead: true }
                : notif
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));

          try {
            await service.markNotificationAsRead(notificationId);
          } catch (error) {
            console.error("Failed to mark as read on server:", error);
          }
        },

        markAllAsRead: async () => {
          set((state) => ({
            notificationHistory: state.notificationHistory.map((notif) => ({
              ...notif,
              isRead: true,
            })),
            unreadCount: 0,
          }));

          try {
            await service.markAllNotificationsAsRead();
          } catch (error) {
            console.error("Failed to mark all as read:", error);
          }
        },

        clearAllNotifications: async () => {
          try {
            await service.clearBadge();
            set({
              notificationHistory: [],
              unreadCount: 0,
            });
          } catch (error) {
            console.error("❌ Failed to clear notifications:", error);
            set({ error: "Failed to clear notifications" });
          }
        },

        // ====================
        // TESTING & UTILITIES
        // ====================
        sendTestNotification: async () => {
          set({ isLoading: true, error: null });

          try {
            const success = await service.sendTestNotification();
            set({ isLoading: false });

            if (!success) {
              set({ error: "Failed to send test notification" });
            }

            return success;
          } catch (error: any) {
            console.error("❌ Test notification failed:", error);
            set({
              error: "Failed to send test notification",
              isLoading: false,
            });
            return false;
          }
        },

        testSubscription: async (subscriptionId: string) => {
          set({ isLoading: true, error: null });

          try {
            const success = await service.testSubscription(subscriptionId);
            set({ isLoading: false });

            if (!success) {
              set({ error: "Failed to send test notification to device" });
            }

            return success;
          } catch (error: any) {
            console.error("❌ Test subscription failed:", error);
            set({
              error: "Failed to send test notification to device",
              isLoading: false,
            });
            return false;
          }
        },

        testAllSubscriptions: async () => {
          set({ isLoading: true, error: null });

          try {
            const success = await service.testAllSubscriptions();
            set({ isLoading: false });

            if (!success) {
              set({ error: "Failed to send test notifications to all devices" });
            }

            return success;
          } catch (error: any) {
            console.error("❌ Test all subscriptions failed:", error);
            set({
              error: "Failed to send test notifications to all devices",
              isLoading: false,
            });
            return false;
          }
        },

        clearError: () => set({ error: null }),
      };
    },
    {
      name: "notification-storage",
      storage: createJSONStorage(() => SecureStorage),
      partialize: (state) => ({
        // Only persist user preferences
        categories: state.categories,
        emailNotificationsEnabled: state.emailNotificationsEnabled,
        pushNotificationsEnabled: state.pushNotificationsEnabled,
      }),
    }
  )
);