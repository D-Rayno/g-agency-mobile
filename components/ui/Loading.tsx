// components/ui/Loading.tsx
/**
 * Enhanced Loading Components
 * Modern spinners and skeleton loaders with animations
 */

import { cn } from '@/utils/cn';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Text, View, ViewProps } from 'react-native';

export interface LoadingProps extends ViewProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const Loading = React.forwardRef<View, LoadingProps>(
  (
    {
      size = 'large',
      color = '#4F46E5',
      text,
      fullScreen = false,
      className,
      variant = 'spinner',
      ...props
    },
    ref
  ) => {
    const containerStyles = fullScreen
      ? 'flex-1 items-center justify-center bg-white'
      : 'items-center justify-center p-8';

    if (variant === 'dots') {
      return (
        <View ref={ref} className={cn(containerStyles, className)} {...props}>
          <LoadingDots color={color} />
          {text && <Text className="text-gray-600 text-sm mt-4">{text}</Text>}
        </View>
      );
    }

    if (variant === 'pulse') {
      return (
        <View ref={ref} className={cn(containerStyles, className)} {...props}>
          <PulseLoader color={color} size={size === 'large' ? 60 : 40} />
          {text && <Text className="text-gray-600 text-sm mt-4">{text}</Text>}
        </View>
      );
    }

    return (
      <View ref={ref} className={cn(containerStyles, className)} {...props}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text className="text-gray-600 text-sm mt-4">{text}</Text>}
      </View>
    );
  }
);

Loading.displayName = 'Loading';

// Animated Loading Dots
const LoadingDots: React.FC<{ color?: string }> = ({ color = '#4F46E5' }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  const animatedStyle = (dot: Animated.Value) => ({
    opacity: dot,
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  });

  return (
    <View className="flex-row gap-2">
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[animatedStyle(dot), { backgroundColor: color }]}
          className="w-3 h-3 rounded-full"
        />
      ))}
    </View>
  );
};

// Pulse Loader
const PulseLoader: React.FC<{ color?: string; size?: number }> = ({
  color = '#4F46E5',
  size = 60,
}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (pulse: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(pulse1, 0);
    animate(pulse2, 750);
  }, []);

  const animatedStyle = (pulse: Animated.Value) => ({
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.5],
        }),
      },
    ],
  });

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Animated.View
        style={[
          animatedStyle(pulse1),
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
      <Animated.View
        style={[
          animatedStyle(pulse2),
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: (size * 0.4) / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

// Enhanced Skeleton Component
export interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  className?: string;
  animated?: boolean;
}

export const Skeleton = React.forwardRef<View, SkeletonProps>(
  (
    {
      width = '100%',
      height = 20,
      variant = 'rectangular',
      className,
      style,
      animated = true,
      ...props
    },
    ref
  ) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (animated) {
        Animated.loop(
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        ).start();
      }
    }, [animated]);

    const variantStyles = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
      rounded: 'rounded-xl',
    };

    const translateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-350, 350],
    });

    return (
      <View
        ref={ref}
        className={cn('bg-gray-200 overflow-hidden', variantStyles[variant], className)}
        style={[{ width: width as any, height: height as any }, style]}
        {...props}
      >
        {animated && (
          <Animated.View
            style={{
              width: '100%',
              height: '100%',
              transform: [{ translateX }],
            }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: 350, height: '100%' }}
            />
          </Animated.View>
        )}
      </View>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Enhanced Skeleton Card
export const SkeletonCard = () => (
  <View className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
    <View className="flex-row items-center mb-4">
      <Skeleton width={48} height={48} variant="circular" className="mr-3" />
      <View className="flex-1">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
    <Skeleton width="100%" height={16} className="mb-2" />
    <Skeleton width="90%" height={16} className="mb-2" />
    <Skeleton width="70%" height={16} className="mb-4" />
    <View className="flex-row gap-2">
      <Skeleton width={100} height={36} variant="rounded" />
      <Skeleton width={100} height={36} variant="rounded" />
    </View>
  </View>
);

// Skeleton List
export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <View className="gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

// Skeleton Profile
export const SkeletonProfile = () => (
  <View className="items-center">
    <Skeleton width={96} height={96} variant="circular" className="mb-4" />
    <Skeleton width={120} height={24} className="mb-2" />
    <Skeleton width={160} height={16} className="mb-6" />
    <View className="w-full gap-3">
      <Skeleton width="100%" height={56} variant="rounded" />
      <Skeleton width="100%" height={56} variant="rounded" />
    </View>
  </View>
);

// Spinner Overlay
export interface SpinnerOverlayProps {
  visible: boolean;
  text?: string;
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({ visible, text }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-max">
      <View className="bg-white rounded-2xl p-6 items-center shadow-2xl">
        <ActivityIndicator size="large" color="#4F46E5" />
        {text && <Text className="text-gray-700 font-medium mt-4">{text}</Text>}
      </View>
    </View>
  );
};