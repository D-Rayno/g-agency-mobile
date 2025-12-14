// components/ui/Card.tsx
import { cn } from '@/utils/cn';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, PressableProps, View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  className?: string;
  gradientColors?: string[];
}

export const Card = React.forwardRef<View, CardProps>(
  (
    {
      children,
      variant = 'default',
      className,
      gradientColors = ['#0ea5e9', '#d946ef'],
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl p-4';

    const variantStyles = {
      default: 'bg-white',
      elevated: 'bg-white shadow-lg',
      outlined: 'bg-white border-2 border-gray-200',
      gradient: '',
    };

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradientColors as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 12,
            padding: 16,
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
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export const PressableCard = React.forwardRef<View, PressableCardProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const baseStyles = 'rounded-xl p-4 active:opacity-80';

    const variantStyles = {
      default: 'bg-white',
      elevated: 'bg-white shadow-lg',
      outlined: 'bg-white border-2 border-gray-200',
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
