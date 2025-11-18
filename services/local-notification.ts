// services/local-notification.ts - Enhanced local notification service
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface LocalNotificationOptions {
  channelId?: string;
  priority?: "default" | "high" | "low";
  sound?: boolean;
  vibrate?: boolean;
  lights?: boolean;
  largeIcon?: string;
  bigPictureUrl?: string;
  badge?: number;
  ongoing?: boolean;
  autoCancel?: boolean;
  smallIcon?: string;
  color?: string;
  tag?: string;
}

export interface ScheduleOptions {
  date?: Date;
  seconds?: number;
  repeats?: boolean;
  weekday?: number; // 1-7, Sunday = 1
  hour?: number;
  minute?: number;
}

export class LocalNotificationService {
  private static instance: LocalNotificationService;
  private isConfigured: boolean = false;
  private notificationListeners: Notifications.Subscription[] = [];

  static getInstance(): LocalNotificationService {
    if (!LocalNotificationService.instance) {
      LocalNotificationService.instance = new LocalNotificationService();
    }
    return LocalNotificationService.instance;
  }

  async configure(): Promise<void> {
    if (this.isConfigured) {
      return;
    }

    try {
      console.log("[LOCAL_NOTIFICATION] Configuring service...");

      // Set notification handler for foreground notifications
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          console.log(
            "[LOCAL_NOTIFICATION] Foreground notification:",
            notification.request.identifier
          );

          return {
            shouldShowBanner: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          } as Notifications.NotificationBehavior;
        },
      });

      // Create notification channels for Android
      if (Platform.OS === "android") {
        await this.createNotificationChannels();
      }

      // Request permissions if on a physical device
      if (Device.isDevice) {
        await this.requestPermissions();
      } else {
        console.log("[LOCAL_NOTIFICATION] Running on simulator/emulator");
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isConfigured = true;
      console.log("[LOCAL_NOTIFICATION] Service configured successfully");
    } catch (error) {
      console.error("[LOCAL_NOTIFICATION] Configuration error:", error);
      throw error;
    }
  }

  private async createNotificationChannels(): Promise<void> {
    console.log(
      "[LOCAL_NOTIFICATION] Creating Android notification channels..."
    );

    const channels = [
      {
        id: "default",
        name: "Default Notifications",
        description: "General notifications",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B35",
        sound: "default",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      },
      {
        id: "high-priority",
        name: "High Priority",
        description: "Important notifications that require immediate attention",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B35",
        sound: "default",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      },
      {
        id: "test-channel",
        name: "Test Notifications",
        description: "Test notifications for debugging",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 100, 100],
        lightColor: "#00FF00",
        sound: "default",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      },
      {
        id: "gifts",
        name: "Gift Notifications",
        description: "Notifications about gifts and rewards",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: "#FFD700",
        sound: "default",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      },
      {
        id: "projects",
        name: "Project Updates",
        description: "Notifications about project progress and updates",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: "#4169E1",
        sound: "default",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      },
      {
        id: "social",
        name: "Social Notifications",
        description: "Social interactions and messages",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 100, 50, 100],
        lightColor: "#32CD32",
        sound: "default",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      },
    ];

    const channelPromises = channels.map(async (channel) => {
      try {
        await Notifications.setNotificationChannelAsync(channel.id, channel);
        console.log(`[LOCAL_NOTIFICATION] Created channel: ${channel.id}`);
      } catch (error) {
        console.error(
          `[LOCAL_NOTIFICATION] Error creating channel ${channel.id}:`,
          error
        );
      }
    });

    await Promise.all(channelPromises);
    console.log("[LOCAL_NOTIFICATION] All notification channels created");
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      console.log("[LOCAL_NOTIFICATION] Requesting permissions...");

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log(
        "[LOCAL_NOTIFICATION] Existing permission status:",
        existingStatus
      );

      if (existingStatus !== "granted") {
        console.log("[LOCAL_NOTIFICATION] Requesting new permissions...");
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: false,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: false,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("[LOCAL_NOTIFICATION] Notification permissions denied");
        return false;
      }

      console.log("[LOCAL_NOTIFICATION] Permissions granted successfully");
      return true;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error requesting permissions:",
        error
      );
      return false;
    }
  }

  private setupNotificationListeners(): void {
    console.log("[LOCAL_NOTIFICATION] Setting up listeners...");

    // Clean up existing listeners
    this.cleanupListeners();

    // Listener for when notification is received while app is foregrounded
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "[LOCAL_NOTIFICATION] Notification received:",
          notification.request.identifier
        );
        console.log(
          "[LOCAL_NOTIFICATION] Content:",
          notification.request.content.title
        );
      }
    );

    // Listener for when user taps notification
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "[LOCAL_NOTIFICATION] Notification tapped:",
          response.notification.request.identifier
        );
        console.log("[LOCAL_NOTIFICATION] Action:", response.actionIdentifier);
        console.log("[LOCAL_NOTIFICATION] User input:", response.userText);

        // The notification response is handled by the main notification service
        // This just logs for debugging purposes
        const notification = response.notification.request.content;
        const data = notification.data;

        if (data) {
          console.log("[LOCAL_NOTIFICATION] Notification data:", data);
        }
      });

    // Store listeners for cleanup
    this.notificationListeners = [receivedListener, responseListener];

    console.log("[LOCAL_NOTIFICATION] Listeners configured");
  }

  showNotification(
    title: string,
    body: string,
    data?: any,
    options: LocalNotificationOptions = {}
  ): void {
    console.log("[LOCAL_NOTIFICATION] Showing notification:", title);

    const {
      channelId = "default",
      priority = "default",
      sound = true,
      vibrate = true,
      badge,
      largeIcon,
      bigPictureUrl,
      ongoing = false,
      autoCancel = true,
      smallIcon,
      color = "#FF6B35",
      tag,
    } = options;

    // Build notification content according to NotificationContentInput type
    const notificationContent: Notifications.NotificationContentInput = {
      title: title,
      body: body,
      data: data || {},
      badge: badge,
      sound: sound ? "default" : false,
    };

    // Platform-specific configurations
    if (Platform.OS === "android") {
      // Android-specific properties
      notificationContent.color = color;
      notificationContent.sticky = ongoing;
      notificationContent.autoDismiss = autoCancel;

      // Map priority to Android priority string
      switch (priority) {
        case "high":
          notificationContent.priority = "high";
          break;
        case "low":
          notificationContent.priority = "low";
          break;
        default:
          notificationContent.priority = "default";
          break;
      }

      // Add vibration pattern
      if (vibrate) {
        notificationContent.vibrate = [0, 250, 250, 250];
      }
    }

    if (Platform.OS === "ios") {
      // iOS-specific properties
      notificationContent.sound = sound;
      notificationContent.badge = badge;

      // Map priority to iOS interruption level
      switch (priority) {
        case "high":
          notificationContent.interruptionLevel = "timeSensitive";
          break;
        case "low":
          notificationContent.interruptionLevel = "passive";
          break;
        default:
          notificationContent.interruptionLevel = "active";
          break;
      }
    }

    // Add image attachments for iOS
    if (bigPictureUrl && Platform.OS === "ios") {
      notificationContent.attachments = [
        {
          identifier: "image",
          url: bigPictureUrl,
          type: "public.image",
          typeHint: "public.image",
          hideThumbnail: false,
          thumbnailClipArea: { x: 0, y: 0, width: 1, height: 1 },
        },
      ];
    }

    // Create the notification request input
    const notificationRequest: Notifications.NotificationRequestInput = {
      identifier: tag || `notification_${Date.now()}`,
      content: notificationContent,
      trigger: channelId ? { channelId } : null, // Use channelId for Android or immediate trigger
    };

    // Schedule the notification
    Notifications.scheduleNotificationAsync(notificationRequest)
      .then((identifier) => {
        console.log(
          "[LOCAL_NOTIFICATION] Notification scheduled with ID:",
          identifier
        );
      })
      .catch((error) => {
        console.error(
          "[LOCAL_NOTIFICATION] Error scheduling notification:",
          error
        );
      });
  }

  async scheduleNotification(
    title: string,
    body: string,
    scheduleOptions: ScheduleOptions,
    data?: any,
    notificationOptions: LocalNotificationOptions = {}
  ): Promise<string | null> {
    try {
      console.log("[LOCAL_NOTIFICATION] Scheduling notification:", title);

      const { date, seconds, repeats, weekday, hour, minute } = scheduleOptions;
      let trigger: Notifications.NotificationTriggerInput | null = null;

      if (date) {
        // Schedule for specific date
        trigger = {
          date,
          repeats: repeats || false,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        } as Notifications.NotificationTriggerInput;
      } else if (seconds) {
        // Schedule for X seconds from now
        trigger = {
          seconds,
          repeats: repeats || false,
        } as Notifications.NotificationTriggerInput;
      } else if (weekday && hour !== undefined && minute !== undefined) {
        // Schedule for specific day of week and time
        trigger = {
          weekday,
          hour,
          minute,
          repeats: repeats || false,
        } as Notifications.NotificationTriggerInput;
      } else if (hour !== undefined && minute !== undefined) {
        // Schedule for daily at specific time
        trigger = {
          hour,
          minute,
          repeats: repeats || false,
        } as Notifications.NotificationTriggerInput;
      }

      if (!trigger) {
        console.error("[LOCAL_NOTIFICATION] Invalid schedule options");
        return null;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: notificationOptions.sound !== false ? "default" : undefined,
          badge: notificationOptions.badge,
        },
        trigger,
      });

      console.log(
        "[LOCAL_NOTIFICATION] Notification scheduled with ID:",
        identifier
      );
      return identifier;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error scheduling notification:",
        error
      );
      return null;
    }
  }

  async cancelNotification(identifier: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log("[LOCAL_NOTIFICATION] Cancelled notification:", identifier);
      return true;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error cancelling notification:",
        error
      );
      return false;
    }
  }

  async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("[LOCAL_NOTIFICATION] Cancelled all scheduled notifications");
      return true;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error cancelling all notifications:",
        error
      );
      return false;
    }
  }

  async dismissAllNotifications(): Promise<boolean> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log("[LOCAL_NOTIFICATION] Dismissed all displayed notifications");
      return true;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error dismissing notifications:",
        error
      );
      return false;
    }
  }

  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      console.log(
        "[LOCAL_NOTIFICATION] Found scheduled notifications:",
        notifications.length
      );
      return notifications;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error getting scheduled notifications:",
        error
      );
      return [];
    }
  }

  async getPresentedNotifications(): Promise<Notifications.Notification[]> {
    try {
      const notifications =
        await Notifications.getPresentedNotificationsAsync();
      console.log(
        "[LOCAL_NOTIFICATION] Found presented notifications:",
        notifications.length
      );
      return notifications;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error getting presented notifications:",
        error
      );
      return [];
    }
  }

  async getApplicationIconBadgeNumber(): Promise<number> {
    try {
      const badgeCount = await Notifications.getBadgeCountAsync();
      console.log("[LOCAL_NOTIFICATION] Current badge count:", badgeCount);
      return badgeCount;
    } catch (error) {
      console.error("[LOCAL_NOTIFICATION] Error getting badge count:", error);
      return 0;
    }
  }

  async setApplicationIconBadgeNumber(number: number): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(number);
      console.log("[LOCAL_NOTIFICATION] Badge count set to:", number);
      return true;
    } catch (error) {
      console.error("[LOCAL_NOTIFICATION] Error setting badge count:", error);
      return false;
    }
  }

  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error(
        "[LOCAL_NOTIFICATION] Error getting permission status:",
        error
      );
      return Notifications.PermissionStatus.UNDETERMINED;
    }
  }

  // Test notification with all features
  async showTestNotification(): Promise<void> {
    this.showNotification(
      "Test Local Notification",
      "This is a comprehensive test of the local notification system with all features enabled.",
      {
        type: "test",
        action: "open_app",
        screen: "/(protected)/profile",
        timestamp: Date.now(),
        testFeatures: {
          sound: true,
          vibration: true,
          lights: true,
          badge: true,
          priority: "high",
        },
      },
      {
        channelId: "test-channel",
        priority: "high",
        sound: true,
        vibrate: true,
        lights: true,
        badge: 1,
        color: "#00FF00",
        autoCancel: true,
        tag: `test_${Date.now()}`,
      }
    );
  }

  // Clean up listeners
  private cleanupListeners(): void {
    this.notificationListeners.forEach((listener) => {
      if (listener) {
        listener.remove();
      }
    });
    this.notificationListeners = [];
  }

  // Cleanup method
  cleanup(): void {
    console.log("[LOCAL_NOTIFICATION] Cleaning up service...");
    this.cleanupListeners();
    this.isConfigured = false;
    console.log("[LOCAL_NOTIFICATION] Service cleaned up");
  }
}
