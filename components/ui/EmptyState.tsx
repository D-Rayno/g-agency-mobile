// components/ui/EmptyState.tsx
/**
 * Enhanced Empty State Component
 * Modern design with illustrations and better visual hierarchy
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps extends ViewProps {
  icon?: React.ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
    variant?: ButtonProps['variant'];
    icon?: keyof typeof Ionicons.glyphMap;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export const EmptyState = React.forwardRef<View, EmptyStateProps>(
  (
    {
      icon,
      iconName,
      title,
      description,
      action,
      secondaryAction,
      className,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const renderIcon = () => {
      if (icon) return icon;
      if (iconName) {
        return (
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name={iconName} size={40} color="#9ca3af" />
          </View>
        );
      }
      return null;
    };

    if (variant === 'minimal') {
      return (
        <View
          ref={ref}
          className={cn('items-center justify-center py-8 px-6', className)}
          {...props}
        >
          <Text className="text-base font-medium text-gray-600 text-center mb-2">
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-gray-500 text-center">{description}</Text>
          )}
        </View>
      );
    }

    if (variant === 'compact') {
      return (
        <View
          ref={ref}
          className={cn('items-center justify-center py-12 px-6', className)}
          {...props}
        >
          {renderIcon() && <View className="mb-4">{renderIcon()}</View>}
          <Text className="text-lg font-bold text-gray-800 text-center mb-2">
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-gray-600 text-center mb-4 max-w-sm">
              {description}
            </Text>
          )}
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size="sm"
              onPress={action.onPress}
              leftIcon={
                action.icon ? (
                  <Ionicons name={action.icon} size={16} color="#ffffff" />
                ) : undefined
              }
            >
              {action.label}
            </Button>
          )}
        </View>
      );
    }

    return (
      <View
        ref={ref}
        className={cn('flex-1 items-center justify-center px-6 py-16', className)}
        {...props}
      >
        {/* Icon Container */}
        {renderIcon() && (
          <View className="mb-6 opacity-90">{renderIcon()}</View>
        )}

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text className="text-base text-gray-600 text-center mb-8 max-w-md leading-relaxed">
            {description}
          </Text>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <View className="flex-row gap-3">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                onPress={action.onPress}
                leftIcon={
                  action.icon ? (
                    <Ionicons name={action.icon} size={20} color="#ffffff" />
                  ) : undefined
                }
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onPress={secondaryAction.onPress}
              >
                {secondaryAction.label}
              </Button>
            )}
          </View>
        )}
      </View>
    );
  }
);

EmptyState.displayName = 'EmptyState';

