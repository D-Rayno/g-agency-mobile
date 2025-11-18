export interface NotificationHistory {
    id: number;
    uuid: string;
    userId?: number;
    title: string; // Translated based on Accept-Language
    body: string; // Translated based on Accept-Language
    data?: any;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    requireInteraction?: boolean;
    type: 'user' | 'broadcast' | 'targeted';
    status?: 'pending' | 'sent' | 'failed';
    createdAt: string;
    updatedAt?: string;
    isRead?: boolean;
}

export interface SubscriptionInfo {
    id: string;
    deviceType: string;
    userAgent?: string;
    createdAt: string;
    isActive: boolean;
    tokenPreview: string;
}

export interface NotificationPreferences {
    pushNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    categories: Record<string, boolean>;
}

// Categories now use translation keys - names will be translated in UI
export const NOTIFICATION_CATEGORIES = {
    SYSTEM: {
        id: 'system',
        nameKey: 'notifications.categories.system', // Translation key
        descriptionKey: 'notifications.categories.systemDesc', // Translation key
        defaultEnabled: true,
        priority: 'high' as const,
    },
    GIFTS: {
        id: 'gifts',
        nameKey: 'notifications.categories.gifts',
        descriptionKey: 'notifications.categories.giftsDesc',
        defaultEnabled: true,
        priority: 'normal' as const,
    },
    PROJECTS: {
        id: 'projects',
        nameKey: 'notifications.categories.projects',
        descriptionKey: 'notifications.categories.projectsDesc',
        defaultEnabled: true,
        priority: 'normal' as const,
    },
    MARKETING: {
        id: 'marketing',
        nameKey: 'notifications.categories.marketing',
        descriptionKey: 'notifications.categories.marketingDesc',
        defaultEnabled: false,
        priority: 'low' as const,
    },
    SOCIAL: {
        id: 'social',
        nameKey: 'notifications.categories.social',
        descriptionKey: 'notifications.categories.socialDesc',
        defaultEnabled: true,
        priority: 'normal' as const,
    },
};