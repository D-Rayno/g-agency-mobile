// components/feedback/LoadingIndicator.tsx
/**
 * Enhanced Loading Indicator Component
 * Modern design with multiple variants and refined styling
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Text, View } from 'react-native';

interface LoadingIndicatorProps {
  message?: string;
  variant?: 'default' | 'minimal' | 'card' | 'overlay';
  size?: 'small' | 'large';
  showIcon?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  variant = 'default',
  size = 'large',
  showIcon = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Minimal variant - just spinner and text
  if (variant === 'minimal') {
    return (
      <View className="flex-row items-center justify-center py-4">
        <ActivityIndicator size={size} color="#6366f1" />
        {message && (
          <Text className="text-gray-700 ml-3 font-medium">{message}</Text>
        )}
      </View>
    );
  }

  // Card variant - contained loading state
  if (variant === 'card') {
    return (
      <View className="bg-white rounded-2xl p-8 items-center border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {showIcon && (
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              marginBottom: 16,
            }}
          >
            <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center">
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="hourglass-outline" size={32} color="#6366f1" />
              </Animated.View>
            </View>
          </Animated.View>
        )}
        <ActivityIndicator size={size} color="#6366f1" />
        {message && (
          <Text className="text-gray-800 mt-4 font-semibold text-center">
            {message}
          </Text>
        )}
      </View>
    );
  }

  // Overlay variant - full screen with backdrop
  if (variant === 'overlay') {
    return (
      <View className="absolute inset-0 bg-black/30 justify-center items-center z-max">
        <View className="bg-white rounded-2xl p-8 items-center mx-8"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {showIcon && (
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                marginBottom: 16,
              }}
            >
              <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center">
                <Animated.View style={{ transform: [{ rotate }] }}>
                  <Ionicons name="hourglass-outline" size={32} color="#6366f1" />
                </Animated.View>
              </View>
            </Animated.View>
          )}
          <ActivityIndicator size={size} color="#6366f1" />
          {message && (
            <Text className="text-gray-800 mt-4 font-semibold text-center">
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Default variant - full screen centered
  return (
    <View className="flex-1 justify-center items-center bg-background px-8">
      {showIcon && (
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            marginBottom: 24,
          }}
        >
          <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center"
            style={{
              shadowColor: '#6366f1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="hourglass-outline" size={40} color="#6366f1" />
            </Animated.View>
          </View>
        </Animated.View>
      )}
      <ActivityIndicator size={size} color="#6366f1" />
      {message && (
        <Text className="text-gray-800 mt-6 font-semibold text-lg text-center">
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingIndicator;