// components/ui/CapacityIndicator.tsx
/**
 * Enhanced Capacity Indicator Component
 * Modern design with smooth animations and refined styling
 */

import { cn } from '@/utils/cn';
import React, { useEffect, useState } from 'react';
import { Animated, Text, View, ViewProps } from 'react-native';

export interface CapacityIndicatorProps extends ViewProps {
  current: number;
  max: number;
  variant?: 'bar' | 'text' | 'circular';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export const CapacityIndicator = React.forwardRef<View, CapacityIndicatorProps>(
  (
    {
      current,
      max,
      variant = 'bar',
      showPercentage = false,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const [widthAnim] = useState(new Animated.Value(0));
    const percentage = Math.min((current / max) * 100, 100);
    const isFull = current >= max;
    const isAlmostFull = percentage >= 80 && percentage < 100;
    const isHalfFull = percentage >= 50 && percentage < 80;

    useEffect(() => {
      if (animated) {
        Animated.spring(widthAnim, {
          toValue: percentage,
          useNativeDriver: false,
          speed: 12,
          bounciness: 6,
        }).start();
      } else {
        widthAnim.setValue(percentage);
      }
    }, [percentage, animated]);

    // Determine color based on percentage
    const getColor = () => {
      if (isFull) return 'error';
      if (isAlmostFull) return 'warning';
      if (isHalfFull) return 'secondary';
      return 'success';
    };

    const color = getColor();

    const colorClasses = {
      success: {
        bg: 'bg-green-500',
        text: 'text-green-700',
        border: 'border-green-500',
        light: 'bg-green-100',
      },
      secondary: {
        bg: 'bg-teal-500',
        text: 'text-teal-700',
        border: 'border-teal-500',
        light: 'bg-teal-100',
      },
      warning: {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        border: 'border-amber-500',
        light: 'bg-amber-100',
      },
      error: {
        bg: 'bg-rose-500',
        text: 'text-rose-700',
        border: 'border-rose-500',
        light: 'bg-rose-100',
      },
    };

    const animatedWidth = widthAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    if (variant === 'text') {
      return (
        <View ref={ref} className={cn('flex-row items-center', className)} {...props}>
          <View className={cn('px-2.5 py-1 rounded-full', colorClasses[color].light)}>
            <Text className={cn('text-sm font-semibold', colorClasses[color].text)}>
              {current} / {max}
            </Text>
          </View>
          {showPercentage && (
            <Text className="text-xs text-gray-500 ml-2">
              ({percentage.toFixed(0)}%)
            </Text>
          )}
        </View>
      );
    }

    if (variant === 'circular') {
      return (
        <View
          ref={ref}
          className={cn(
            'w-16 h-16 rounded-full items-center justify-center border-4',
            colorClasses[color].border,
            colorClasses[color].light,
            className
          )}
          style={{
            shadowColor: color === 'success' ? '#22c55e' : 
                        color === 'secondary' ? '#14b8a6' :
                        color === 'warning' ? '#f59e0b' : '#ef4444',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
          }}
          {...props}
        >
          <Text className={cn('text-base font-bold', colorClasses[color].text)}>
            {current}
          </Text>
          <Text className="text-xs text-gray-500">of {max}</Text>
        </View>
      );
    }

    // Default: bar variant
    return (
      <View ref={ref} className={cn('w-full', className)} {...props}>
        {/* Progress Bar */}
        <View 
          className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 1,
            elevation: 1,
          }}
        >
          <Animated.View
            className={cn('h-full rounded-full', colorClasses[color].bg)}
            style={{ width: animatedWidth }}
          />
        </View>

        {/* Label */}
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm text-gray-600 font-medium">
            {current} / {max}
          </Text>
          {showPercentage && (
            <View className={cn('px-2 py-0.5 rounded-full', colorClasses[color].light)}>
              <Text className={cn('text-xs font-semibold', colorClasses[color].text)}>
                {percentage.toFixed(0)}%{isFull && ' Full'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
);

CapacityIndicator.displayName = 'CapacityIndicator';