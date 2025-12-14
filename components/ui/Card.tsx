// components/ui/Card.tsx
/**
 * Enhanced Premium Card Component
 * Improved spacing, shadows, and visual hierarchy
 */

import { cn } from '@/utils/cn';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, PressableProps, View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'premium';
  className?: string;
  gradientColors?: string[];
}

export const Card = React.forwardRef<View, CardProps>(
  (
    {
      children,
      variant = 'default',
      className,
      gradientColors = ['#4F46E5', '#14B8A6'],
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl p-5';

    const variantStyles = {
      default: 'bg-white shadow-sm border border-gray-100',
      elevated: 'bg-white shadow-xl border border-gray-100',
      outlined: 'bg-white border-2 border-gray-200',
      premium: 'bg-white shadow-2xl border border-gray-50',
      gradient: '',
    };

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradientColors as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 20,
          }}
          className={className}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

// Pressable Card Component
export interface PressableCardProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'premium';
  className?: string;
}

export const PressableCard = React.forwardRef<View, PressableCardProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const baseStyles = 'rounded-2xl p-5 active:opacity-90 active:scale-[0.98]';

    const variantStyles = {
      default: 'bg-white shadow-sm border border-gray-100',
      elevated: 'bg-white shadow-xl border border-gray-100',
      outlined: 'bg-white border-2 border-gray-200',
      premium: 'bg-white shadow-2xl border border-gray-50',
    };

    return (
      <Pressable
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);

PressableCard.displayName = 'PressableCard';
