// app/_layout.tsx
import { toastConfig } from '@/components/toast/config';
import { LocalNotificationService } from '@/services/local-notification';
import { PushNotificationService } from '@/services/notification';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useEffect(() => {
    // Initialize notification services
    const initServices = async () => {
      try {
        const localService = LocalNotificationService.getInstance();
        await localService.configure();
        
        const pushService = PushNotificationService.getInstance();
        await pushService.initialize();
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initServices();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}