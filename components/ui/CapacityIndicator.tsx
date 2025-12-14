// components/ui/CapacityIndicator.tsx
import { cn } from '@/utils/cn';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface CapacityIndicatorProps extends ViewProps {
  current: number;
  max: number;
  variant?: 'bar' | 'text' | 'circular';
  showPercentage?: boolean;
  className?: string;
}

export const CapacityIndicator = React.forwardRef<View, CapacityIndicatorProps>(
  (
    {
      current,
      max,
      variant = 'bar',
      showPercentage = false,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min((current / max) * 100, 100);
    const isFull = current >= max;
    const isAlmostFull = percentage >= 80 && percentage < 100;
    const isHalfFull = percentage >= 50 && percentage < 80;

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
        bg: 'bg-success-500',
        text: 'text-success-700',
        border: 'border-success-500',
      },
      secondary: {
        bg: 'bg-secondary-500',
        text: 'text-secondary-700',
        border: 'border-secondary-500',
      },
      warning: {
        bg: 'bg-warning-500',
        text: 'text-warning-700',
        border: 'border-warning-500',
      },
      error: {
        bg: 'bg-error-500',
        text: 'text-error-700',
        border: 'border-error-500',
      },
    };

    if (variant === 'text') {
      return (
        <View ref={ref} className={cn('flex-row items-center', className)} {...props}>
          <Text className={cn('text-sm font-semibold', colorClasses[color].text)}>
            {current}/{max}
          </Text>
          {showPercentage && (
            <Text className="text-xs text-gray-500 ml-1">
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
            className
          )}
          {...props}
        >
          <Text className={cn('text-xs font-bold', colorClasses[color].text)}>
            {current}
          </Text>
          <Text className="text-2xs text-gray-500">/ {max}</Text>
        </View>
      );
    }

    // Default: bar variant
    return (
      <View ref={ref} className={cn('w-full', className)} {...props}>
        {/* Progress Bar */}
        <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className={cn('h-full rounded-full', colorClasses[color].bg)}
            style={{ width: `${percentage}%` }}
          />
        </View>

        {/* Label */}
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-xs text-gray-600">
            {current} / {max}
          </Text>
          {showPercentage && (
            <Text className={cn('text-xs font-medium', colorClasses[color].text)}>
              {percentage.toFixed(0)}% {isFull && 'Full'}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

CapacityIndicator.displayName = 'CapacityIndicator';
