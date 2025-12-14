// components/ui/Badge.tsx
import { cn } from '@/utils/cn';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  textClassName?: string;
}

export const Badge = React.forwardRef<View, BadgeProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      rounded = false,
      className,
      textClassName,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center';

    const variantStyles = {
      primary: 'bg-primary-100 border border-primary-200',
      secondary: 'bg-secondary-100 border border-secondary-200',
      success: 'bg-success-100 border border-success-200',
      warning: 'bg-warning-100 border border-warning-200',
      error: 'bg-error-100 border border-error-200',
      gray: 'bg-gray-100 border border-gray-200',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 rounded',
      md: 'px-2.5 py-1 rounded-md',
      lg: 'px-3 py-1.5 rounded-lg',
    };

    const textVariantStyles = {
      primary: 'text-primary-700',
      secondary: 'text-secondary-700',
      success: 'text-success-700',
      warning: 'text-warning-700',
      error: 'text-error-700',
      gray: 'text-gray-700',
    };

    const textSizeStyles = {
      sm: 'text-2xs',
      md: 'text-xs',
      lg: 'text-sm',
    };

    const roundedStyles = rounded ? 'rounded-full' : '';

    return (
      <View
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          roundedStyles,
          className
        )}
        {...props}
      >
        <Text
          className={cn(
            'font-medium',
            textVariantStyles[variant],
            textSizeStyles[size],
            textClassName
          )}
        >
          {children}
        </Text>
      </View>
    );
  }
);

Badge.displayName = 'Badge';

// Dot Badge for notifications
export interface DotBadgeProps extends ViewProps {
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DotBadge = React.forwardRef<View, DotBadgeProps>(
  ({ variant = 'error', size = 'md', className, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600',
    };

    const sizeStyles = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
    };

    return (
      <View
        ref={ref}
        className={cn(
          'rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

DotBadge.displayName = 'DotBadge';
