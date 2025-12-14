// components/feedback/LoadingIndicator.tsx
/**
 * Loading Indicator Component
 * Pure NativeWind styling - no theme hooks
 */

import { ActivityIndicator, Text, View } from 'react-native';

export default ({ message }: { message: string }) => {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text className="text-gray-800 mt-4">{message}</Text>
    </View>
  );
};
