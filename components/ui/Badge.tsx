// components/ui/Badge.tsx
/**
 * Enhanced Badge Component
 * Modern design with refined styling and versatile variants
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  rounded?: boolean;
  outlined?: boolean;
  className?: string;
}

export const Badge = React.forwardRef<View, BadgeProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      rounded = true,
      outlined = false,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: outlined
        ? 'bg-transparent border-2 border-indigo-600'
        : 'bg-indigo-100 border border-indigo-200',
      secondary: outlined
        ? 'bg-transparent border-2 border-teal-600'
        : 'bg-teal-100 border border-teal-200',
      success: outlined
        ? 'bg-transparent border-2 border-green-600'
        : 'bg-green-100 border border-green-200',
      warning: outlined
        ? 'bg-transparent border-2 border-amber-600'
        : 'bg-amber-100 border border-amber-200',
      error: outlined
        ? 'bg-transparent border-2 border-rose-600'
        : 'bg-rose-100 border border-rose-200',
      gray: outlined
        ? 'bg-transparent border-2 border-gray-600'
        : 'bg-gray-100 border border-gray-200',
    };

    const textVariantStyles = {
      primary: outlined ? 'text-indigo-700' : 'text-indigo-700',
      secondary: outlined ? 'text-teal-700' : 'text-teal-700',
      success: outlined ? 'text-green-700' : 'text-green-700',
      warning: outlined ? 'text-amber-700' : 'text-amber-700',
      error: outlined ? 'text-rose-700' : 'text-rose-700',
      gray: outlined ? 'text-gray-700' : 'text-gray-700',
    };

    const iconColors = {
      primary: '#4338ca',
      secondary: '#0f766e',
      success: '#15803d',
      warning: '#b45309',
      error: '#be123c',
      gray: '#374151',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5',
      md: 'px-2.5 py-1',
      lg: 'px-3 py-1.5',
    };

    const textSizeStyles = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    const iconSizes = {
      sm: 12,
      md: 14,
      lg: 16,
    };

    return (
      <View
        ref={ref}
        className={cn(
          'flex-row items-center inline-flex',
          variantStyles[variant],
          sizeStyles[size],
          rounded ? 'rounded-full' : 'rounded-md',
          className
        )}
        style={{
          shadowColor: outlined ? 'transparent' : '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: outlined ? 0 : 0.05,
          shadowRadius: 1,
          elevation: outlined ? 0 : 1,
        }}
        {...props}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={iconSizes[size]}
            color={iconColors[variant]}
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          className={cn(
            'font-semibold',
            textVariantStyles[variant],
            textSizeStyles[size]
          )}
        >
          {children}
        </Text>
      </View>
    );
  }
);

Badge.displayName = 'Badge';