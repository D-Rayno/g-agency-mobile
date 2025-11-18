// firebase/config.ts - React Native Firebase
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';

// No initialization needed - configured via google-services.json & GoogleService-Info.plist

export { analytics, messaging };

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
}

// Get FCM token
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}