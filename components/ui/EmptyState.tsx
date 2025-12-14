// components/ui/EmptyState.tsx
import { cn } from '@/utils/cn';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps extends ViewProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
    variant?: ButtonProps['variant'];
  };
  className?: string;
}

export const EmptyState = React.forwardRef<View, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <View
        ref={ref}
        className={cn(
          'flex-1 items-center justify-center px-6 py-12',
          className
        )}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <View className="mb-4 opacity-40">
            {icon}
          </View>
        )}

        {/* Title */}
        <Text className="text-xl font-bold text-gray-800 text-center mb-2">
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text className="text-base text-gray-500 text-center mb-6 max-w-sm">
            {description}
          </Text>
        )}

        {/* Action Button */}
        {action && (
          <Button
            variant={action.variant || 'primary'}
            onPress={action.onPress}
          >
            {action.label}
          </Button>
        )}
      </View>
    );
  }
);

EmptyState.displayName = 'EmptyState';
