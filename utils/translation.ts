// utils/translation.ts - Translation utilities for consistent i18n usage
import AppI18nManager from '@/i18n/config';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * Safe translation function that can be used anywhere
 * Falls back to the key if translation fails
 */
export const t = (key: string, options?: any): string => {
  try {
    return AppI18nManager.translate(key, options);
  } catch (error) {
    console.warn('Translation failed for key:', key, error);
    return key;
  }
};

export const handleBackendMessage = (message: string, fallbackKey?: string): string => {
  // Backend messages are already translated, but provide fallback
  if (!message && fallbackKey) {
    return t(fallbackKey);
  }
  return message || t('common.errorMessage');
};

/**
 * Translated Alert function
 */
export const showAlert = (
  titleKey: string,
  messageKey: string,
  buttons?: Array<{
    textKey: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }>,
  options?: {
    cancelable?: boolean;
  }
) => {
  Alert.alert(
    t(titleKey),
    t(messageKey),
    buttons?.map(button => ({
      text: t(button.textKey),
      style: button.style,
      onPress: button.onPress,
    })),
    options
  );
};

/**
 * Translated Toast functions
 */
export const showToast = {
  success: (text1Key: string, text2Key?: string, options?: any) => {
    Toast.show({
      type: 'success',
      text1: t(text1Key, options),
      text2: text2Key ? t(text2Key, options) : undefined,
      visibilityTime: 3000,
    });
  },
  
  error: (text1Key: string, text2Key?: string, options?: any) => {
    Toast.show({
      type: 'error',
      text1: t(text1Key, options),
      text2: text2Key ? t(text2Key, options) : undefined,
      visibilityTime: 4000,
    });
  },
  
  info: (text1Key: string, text2Key?: string, options?: any) => {
    Toast.show({
      type: 'info',
      text1: t(text1Key, options),
      text2: text2Key ? t(text2Key, options) : undefined,
      visibilityTime: 3000,
    });
  },
  
  warning: (text1Key: string, text2Key?: string, options?: any) => {
    Toast.show({
      type: 'info', // React Native Toast Message doesn't have warning, use info
      text1: t(text1Key, options),
      text2: text2Key ? t(text2Key, options) : undefined,
      visibilityTime: 3000,
    });
  },
};

/**
 * Common error message handler for API errors
 * Shows backend error message if available, otherwise shows translated generic error
 */
export const handleApiError = (
  error: any,
  fallbackTitleKey: string = 'common.error',
  fallbackMessageKey: string = 'common.errorMessage'
) => {
  let errorMessage = '';
  
  // Check if error has a response with message (backend error)
  if (error?.response?.data?.message) {
    // Backend messages are already translated, use them directly
    errorMessage = handleBackendMessage(error.response.data.message, fallbackMessageKey);
  } else if (error?.message) {
    // Network or other errors
    errorMessage = error.message;
  } else {
    // Fallback to translated generic error
    errorMessage = t(fallbackMessageKey);
  }

  
  
  Toast.show({
    type: 'error',
    text1: t(fallbackTitleKey),
    text2: errorMessage,
    visibilityTime: 4000,
  });
};

/**
 * Confirmation dialog utility
 */
export const showConfirmDialog = (
  titleKey: string,
  messageKey: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmTextKey: string = 'common.confirm',
  cancelTextKey: string = 'common.cancel'
) => {
  Alert.alert(
    t(titleKey),
    t(messageKey),
    [
      {
        text: t(cancelTextKey),
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: t(confirmTextKey),
        style: 'default',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};

/**
 * Destructive confirmation dialog
 */
export const showDestructiveDialog = (
  titleKey: string,
  messageKey: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmTextKey: string = 'common.delete',
  cancelTextKey: string = 'common.cancel'
) => {
  Alert.alert(
    t(titleKey),
    t(messageKey),
    [
      {
        text: t(cancelTextKey),
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: t(confirmTextKey),
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};