// firebase/config.ts - Updated to use modular API
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';

// No initialization needed - configured via google-services.json & GoogleService-Info.plist

export { analytics, messaging };

// Request notification permission with modular API
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      console.log('✅ Notification permission granted');
    } else {
      console.log('❌ Notification permission denied');
    }
    
    return enabled;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

// Get FCM token with error handling
export async function getFCMToken(): Promise<string | null> {
  try {
    // Check if device is registered first
    const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
    
    if (!isRegistered) {
      await messaging().registerDeviceForRemoteMessages();
    }
    
    const token = await messaging().getToken();
    console.log('✅ FCM Token obtained:', token?.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

// Check if Firebase is properly configured
export async function checkFirebaseConfig(): Promise<boolean> {
  try {
    // Try to get permission status to verify Firebase is working
    await messaging().hasPermission();
    console.log('✅ Firebase is properly configured');
    return true;
  } catch (error) {
    console.error('❌ Firebase configuration error:', error);
    return false;
  }
}