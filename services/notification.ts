// services/notification.ts - Fixed with better error handling
import { apiClient } from "@/services/api";
import { ApiResponse } from "@/types/api";
import {
  NotificationHistory,
  NotificationPreferences,
  SubscriptionInfo,
} from "@/types/notification";
import { SecureStorage } from "@/utils/secure-storage";
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { AxiosInstance } from "axios";
import { router } from "expo-router";
import { AppState, Platform } from "react-native";
import { LocalNotificationService } from "./local-notification";

interface SubscribeOptions {
  categories?: string[];
}

const TOKEN_STORAGE_KEY = "push_token";
const SUBSCRIPTION_STATUS_KEY = "notification_subscribed";
const SUBSCRIPTION_CATEGORIES_KEY = "notification_categories";

export class PushNotificationService {
  private static instance: PushNotificationService;
  private currentToken: string | null = null;
  private isInitialized: boolean = false;
  private isRequestingPermissions: boolean = false;
  private client: AxiosInstance = apiClient;
  private localNotificationService: LocalNotificationService;
  private cleanupFunctions: Array<() => void> = [];
  private initializationError: Error | null = null;

  private constructor() {
    this.localNotificationService = LocalNotificationService.getInstance();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log("⚠️ Service already initialized");
      return true;
    }

    try {
      console.log("🔧 Initializing notification service...");

      // Step 1: Initialize local notification service
      try {
        await this.localNotificationService.configure();
        console.log("✅ Local notifications configured");
      } catch (error) {
        console.error("❌ Local notification setup failed:", error);
        // Continue anyway - push notifications might still work
      }

      // Step 2: Register device for remote messages
      try {
        const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
        if (!isRegistered) {
          console.log("📱 Registering device for remote messages...");
          await messaging().registerDeviceForRemoteMessages();
          console.log("✅ Device registered");
        }
      } catch (error) {
        console.error("❌ Device registration failed:", error);
        throw new Error(`Firebase device registration failed: ${error}`);
      }

      // Step 3: Setup listeners
      try {
        this.setupNotificationListeners();
        console.log("✅ Notification listeners setup");
      } catch (error) {
        console.error("❌ Listener setup failed:", error);
        // Continue - we can retry listeners later
      }

      // Step 4: Setup app state listener
      try {
        this.setupAppStateListener();
        console.log("✅ App state listener setup");
      } catch (error) {
        console.error("❌ App state listener failed:", error);
      }

      // Step 5: Initialize token
      try {
        await this.initializeToken();
        console.log("✅ Token initialized");
      } catch (error) {
        console.error("❌ Token initialization failed:", error);
        // Don't throw - we can retry later
      }

      this.isInitialized = true;
      console.log("✅ Notification service initialized successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Failed to initialize notification service:", error);
      this.initializationError = error;
      
      // Return false but don't crash the app
      return false;
    }
  }

  private async initializeToken(): Promise<void> {
    try {
      // Try to restore saved token
      const savedToken = await SecureStorage.getItem(TOKEN_STORAGE_KEY);
      if (savedToken) {
        this.currentToken = savedToken;
        console.log("📱 Restored saved token");
      }

      // Request permissions (won't show dialog if already granted)
      await this.requestPermissions();

      // Get fresh token
      const newToken = await messaging().getToken();
      
      if (!newToken || newToken.length < 100) {
        throw new Error("Invalid token received from Firebase");
      }

      this.currentToken = newToken;

      // Save if different
      if (savedToken !== newToken) {
        await SecureStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        console.log("💾 New token saved");
      }

      // Setup token refresh listener
      const unsubscribe = messaging().onTokenRefresh(async (token) => {
        console.log("🔄 Token refreshed");
        this.currentToken = token;
        await SecureStorage.setItem(TOKEN_STORAGE_KEY, token);
        await this.resubscribeWithNewToken();
      });

      this.cleanupFunctions.push(unsubscribe);
      console.log("📱 Token initialized successfully");
    } catch (error) {
      console.error("❌ Token initialization failed:", error);
      throw error;
    }
  }

  private async resubscribeWithNewToken(): Promise<void> {
    try {
      if (!this.currentToken) return;

      const categoriesJson = await SecureStorage.getItem(SUBSCRIPTION_CATEGORIES_KEY);
      const categories = categoriesJson ? JSON.parse(categoriesJson) : [];

      await this.client.post("/notifications/subscribe", {
        token: this.currentToken,
        deviceType: Platform.OS,
        categories,
      });

      console.log("✅ Re-subscribed with new token");
    } catch (error) {
      console.error("❌ Re-subscribe failed:", error);
    }
  }

  private setupNotificationListeners(): void {
    console.log("👂 Setting up notification listeners");

    try {
      // Foreground messages
      const unsubscribeForeground = messaging().onMessage(
        async (message: FirebaseMessagingTypes.RemoteMessage) => {
          console.log("📨 Foreground notification:", message.notification?.title);

          if (message.notification) {
            this.localNotificationService.showNotification(
              message.notification.title || "Notification",
              message.notification.body || "",
              message.data || {},
              {
                channelId: (message.data?.category as string) || "default",
                priority: message.data?.priority === "high" ? "high" : "default",
              }
            );
          }
        }
      );

      // Background messages
      messaging().setBackgroundMessageHandler(
        async (message: FirebaseMessagingTypes.RemoteMessage) => {
          console.log("📨 Background notification:", message.notification?.title);
        }
      );

      // Notification opened from background
      const unsubscribeOpened = messaging().onNotificationOpenedApp(
        (message: FirebaseMessagingTypes.RemoteMessage) => {
          console.log("👆 Notification tapped (background)");
          this.handleNotificationTap(message.data);
        }
      );

      // App opened from notification (killed state)
      messaging()
        .getInitialNotification()
        .then((message: FirebaseMessagingTypes.RemoteMessage | null) => {
          if (message) {
            console.log("👆 App opened from notification");
            setTimeout(() => {
              this.handleNotificationTap(message.data);
            }, 1500);
          }
        });

      this.cleanupFunctions.push(unsubscribeForeground, unsubscribeOpened);
    } catch (error) {
      console.error("❌ Error setting up listeners:", error);
      throw error;
    }
  }

  private setupAppStateListener(): void {
    try {
      const subscription = AppState.addEventListener("change", (nextAppState) => {
        if (nextAppState === "active") {
          this.refreshTokenIfNeeded();
        }
      });

      this.cleanupFunctions.push(() => subscription.remove());
    } catch (error) {
      console.error("❌ App state listener error:", error);
    }
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    try {
      const savedToken = await SecureStorage.getItem(TOKEN_STORAGE_KEY);
      const currentToken = await messaging().getToken();

      if (savedToken !== currentToken) {
        this.currentToken = currentToken;
        await SecureStorage.setItem(TOKEN_STORAGE_KEY, currentToken);
        await this.resubscribeWithNewToken();
      }
    } catch (error) {
      console.error("❌ Token refresh check failed:", error);
    }
  }

  private handleNotificationTap(data: any): void {
    console.log("🔄 Processing notification tap:", data);

    try {
      if (data?.url) {
        router.push(data.url);
      } else if (data?.screen) {
        router.push(data.screen);
      } else {
        router.push("/(admin)");
      }
    } catch (error) {
      console.error("❌ Navigation error:", error);
      router.push("/(admin)");
    }
  }

  // Public API Methods

  getInitializationError(): Error | null {
    return this.initializationError;
  }

  async getPermissionStatus(): Promise<"granted" | "denied" | "undetermined"> {
    try {
      const authStatus = await messaging().hasPermission();

      if (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        return "granted";
      } else if (authStatus === messaging.AuthorizationStatus.DENIED) {
        return "denied";
      } else {
        return "undetermined";
      }
    } catch (error) {
      console.error("Failed to get permission status:", error);
      return "undetermined";
    }
  }

  async requestPermissions(): Promise<{
    granted: boolean;
    token?: string;
    error?: string;
  }> {
    if (this.isRequestingPermissions) {
      return {
        granted: false,
        error: "Permission request already in progress",
      };
    }

    this.isRequestingPermissions = true;

    try {
      const existingStatus = await this.getPermissionStatus();

      if (existingStatus === "granted") {
        this.isRequestingPermissions = false;
        return {
          granted: true,
          token: this.currentToken!,
        };
      }

      if (existingStatus === "denied") {
        this.isRequestingPermissions = false;
        return {
          granted: false,
          error: "Permissions previously denied. Please enable in settings.",
        };
      }

      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
      });

      const granted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (granted && !this.currentToken) {
        await this.initializeToken();
      }

      this.isRequestingPermissions = false;

      return {
        granted,
        token: granted ? this.currentToken! : undefined,
        error: granted ? undefined : "Permissions denied",
      };
    } catch (error: any) {
      this.isRequestingPermissions = false;
      console.error("Permission request failed:", error);
      return {
        granted: false,
        error: error.message || "Failed to request permissions",
      };
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await this.client.post(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return false;
    }
  }

  async checkPermissionStatus(): Promise<"granted" | "denied" | "undetermined"> {
    return this.getPermissionStatus();
  }

  async subscribe(options: SubscribeOptions = {}): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.currentToken) {
        const permResult = await this.requestPermissions();
        if (!permResult.granted) {
          return {
            success: false,
            error: permResult.error || "No push token available",
          };
        }
      }

      const { categories = [] } = options;

      const response = await this.client.post("/notifications/subscribe", {
        token: this.currentToken,
        deviceType: Platform.OS,
        categories,
      });

      if (response.data.success) {
        await SecureStorage.setItem(SUBSCRIPTION_STATUS_KEY, "true");
        await SecureStorage.setItem(SUBSCRIPTION_CATEGORIES_KEY, JSON.stringify(categories));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Subscription failed",
        };
      }
    } catch (error: any) {
      console.error("Subscribe failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Subscription failed",
      };
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.currentToken) {
        return true;
      }

      await this.client.post("/notifications/unsubscribe", {
        token: this.currentToken,
      });

      await SecureStorage.multiRemove([SUBSCRIPTION_STATUS_KEY, SUBSCRIPTION_CATEGORIES_KEY]);

      return true;
    } catch (error) {
      console.error("Unsubscribe failed:", error);
      return false;
    }
  }

  async unsubscribeById(subscriptionId: string): Promise<boolean> {
    try {
      await this.client.post(`/notifications/unsubscribe/${subscriptionId}`);
      return true;
    } catch (error) {
      console.error("Unsubscribe by ID failed:", error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    try {
      const status = await SecureStorage.getItem(SUBSCRIPTION_STATUS_KEY);
      return status === "true" && this.currentToken !== null;
    } catch (error) {
      return false;
    }
  }

  async getSubscriptions(): Promise<SubscriptionInfo[]> {
    try {
      const response = await this.client.get<ApiResponse<{ subscriptions: SubscriptionInfo[] }>>(
        "/notifications/subscriptions"
      );

      if (response.data.success && response.data.data) {
        return response.data.data.subscriptions;
      }
      return [];
    } catch (error) {
      console.error("Failed to get subscriptions:", error);
      return [];
    }
  }

  async getNotificationHistory(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: NotificationHistory[]; hasMore: boolean }> {
    try {
      const response = await this.client.get<
        ApiResponse<{
          notifications: NotificationHistory[];
          hasMore: boolean;
        }>
      >(`/notifications/history?limit=${limit}&offset=${offset}`);

      if (response.data.success && response.data.data) {
        const notifications = response.data.data.notifications.map((notif) => ({
          ...notif,
          isRead: notif.isRead ?? false,
        }));
        return {
          notifications,
          hasMore: response.data.data.hasMore,
        };
      }

      return { notifications: [], hasMore: false };
    } catch (error) {
      console.error("Failed to get notification history:", error);
      return { notifications: [], hasMore: false };
    }
  }

  async updatePreferences(preferences: {
    categories?: Record<string, boolean>;
    emailNotificationsEnabled?: boolean;
    pushNotificationsEnabled?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.client.put("/notifications/preferences", preferences);

      if (response.data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to update preferences",
        };
      }
    } catch (error: any) {
      console.error("Update preferences failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to update preferences",
      };
    }
  }

  async getPreferences(): Promise<{
    success: boolean;
    data?: NotificationPreferences;
    error?: string;
  }> {
    try {
      const response = await this.client.get<ApiResponse<NotificationPreferences>>(
        "/notifications/preferences"
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to get preferences",
        };
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: "No preferences found",
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to get preferences",
      };
    }
  }

  async sendTestNotification(): Promise<boolean> {
    try {
      if (!this.currentToken) {
        return false;
      }

      this.localNotificationService.showNotification(
        "Test Notification",
        "This is a test notification. Tap to open the app!",
        {
          type: "test",
          screen: "/(protected)/profile",
        },
        {
          channelId: "test-channel",
          priority: "high",
        }
      );

      const response = await this.client.post("/notifications/test", {
        token: this.currentToken,
      });

      return response.data.success;
    } catch (error) {
      console.error("Test notification failed:", error);
      return false;
    }
  }

  async testSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await this.client.post(`/notifications/test/${subscriptionId}`);
      return response.data.success;
    } catch (error) {
      console.error(`Test notification for subscription ${subscriptionId} failed:`, error);
      return false;
    }
  }

  async testAllSubscriptions(): Promise<boolean> {
    try {
      const response = await this.client.post("/notifications/test-all");
      return response.data.success;
    } catch (error) {
      console.error("Test all subscriptions failed:", error);
      return false;
    }
  }

  async clearBadge(): Promise<void> {
    await this.localNotificationService.setApplicationIconBadgeNumber(0);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.clearBadge();
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }

  isSupported(): boolean {
    return true;
  }

  cleanup(): void {
    console.log("🧹 Cleaning up notification service");

    this.cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    });

    this.cleanupFunctions = [];
    this.isInitialized = false;
    this.initializationError = null;
    
    console.log("✅ Notification service cleaned up");
  }
}