// utils/image.ts
/**
 * Image URL utility for handling API image paths
 * Constructs full URLs from relative paths returned by the API
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3333';

/**
 * Converts a relative image path to a full URL
 * @param src - Image source from API (can be relative path, full URL, or null)
 * @returns Full image URL or null
 */
export const getImageUrl = (src: string | null | undefined): string | null => {
    if (!src) return null;

    // If already a full URL, return as is
    if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
    }

    // Ensure path starts with /
    const path = src.startsWith('/') ? src : `/${src}`;

    return `${BASE_URL}${path}`;
};

/**
 * Get placeholder image URL for missing images
 */
export const getPlaceholderUrl = (type: 'event' | 'user' | 'default' = 'default'): string => {
    // You can return a placeholder image URL or null to show default UI
    return '';
};
