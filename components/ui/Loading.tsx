// components/ui/Loading.tsx
import { cn } from '@/utils/cn';
import React from 'react';
import { ActivityIndicator, Text, View, ViewProps } from 'react-native';

export interface LoadingProps extends ViewProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading = React.forwardRef<View, LoadingProps>(
  (
    {
      size = 'large',
      color = '#0ea5e9',
      text,
      fullScreen = false,
      className,
      ...props
    },
    ref
  ) => {
    const containerStyles = fullScreen
      ? 'flex-1 items-center justify-center bg-white'
      : 'items-center justify-center p-8';

    return (
      <View ref={ref} className={cn(containerStyles, className)} {...props}>
        <ActivityIndicator size={size} color={color} />
        {text && (
          <Text className="text-gray-600 text-sm mt-4">{text}</Text>
        )}
      </View>
    );
  }
);

Loading.displayName = 'Loading';

// Skeleton Loader Component
export interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

export const Skeleton = React.forwardRef<View, SkeletonProps>(
  (
    {
      width = '100%',
      height = 20,
      variant = 'rectangular',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    return (
      <View
        ref={ref}
        className={cn(
          'bg-gray-200 animate-pulse',
          variantStyles[variant],
          className
        )}
        style={[
          {
            width: width as any,
            height: height as any,
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton Group for common loading patterns
export const SkeletonCard = () => (
  <View className="bg-white rounded-xl p-4 space-y-3">
    <Skeleton width="60%" height={24} />
    <Skeleton width="100%" height={16} />
    <Skeleton width="80%" height={16} />
    <View className="flex-row space-x-2 mt-4">
      <Skeleton width={80} height={32} />
      <Skeleton width={80} height={32} />
    </View>
  </View>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <View className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);
