// app/_layout.tsx
import { toastConfig } from '@/components/toast/config';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors if already prevented
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('🚀 App initializing...');
        
        // IMPORTANT: Don't initialize notification services here
        // They will be initialized when the user logs in (via useNotification hook)
        
        // Wait a small amount for any critical setup
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ App initialization complete');
        setIsReady(true);
      } catch (error) {
        console.error('❌ App initialization error:', error);
        // Still mark as ready to show the app (even with errors)
        setIsReady(true);
      }
    }

    initializeApp();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Hide splash screen when ready
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
    }
  }, [isReady]);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1F6F61" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}