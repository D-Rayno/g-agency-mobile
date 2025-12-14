// components/ui/Card.tsx
/**
 * Enhanced Premium Card Component
 * Modern design with hover effects and better visual hierarchy
 */

import { cn } from '@/utils/cn';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Animated, Pressable, PressableProps, View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'premium' | 'glass';
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
      default: 'bg-white shadow-md border border-gray-100',
      elevated: 'bg-white shadow-xl border border-gray-50',
      outlined: 'bg-white border-2 border-gray-200',
      premium: 'bg-white shadow-2xl border-2 border-gray-50',
      glass: 'bg-white/80 backdrop-blur-lg shadow-lg border border-white/20',
      gradient: '',
    };

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradientColors as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 20 }}
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

// Enhanced Pressable Card with animations
export interface PressableCardProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'premium';
  className?: string;
  hapticFeedback?: boolean;
  animated?: boolean;
}

export const PressableCard = React.forwardRef<View, PressableCardProps>(
  (
    {
      children,
      variant = 'default',
      className,
      hapticFeedback = true,
      animated = true,
      onPress,
      ...props
    },
    ref
  ) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      if (animated) {
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    };

    const handlePressOut = () => {
      if (animated) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    };

    const handlePress = (event: any) => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(event);
    };

    const baseStyles = 'rounded-2xl p-5 overflow-hidden';

    const variantStyles = {
      default: 'bg-white shadow-md border border-gray-100 active:shadow-lg',
      elevated: 'bg-white shadow-xl border border-gray-50 active:shadow-2xl',
      outlined: 'bg-white border-2 border-gray-200 active:border-primary-500',
      premium: 'bg-white shadow-2xl border-2 border-gray-50 active:border-primary-100',
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          ref={ref}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={cn(baseStyles, variantStyles[variant], className)}
          {...props}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }
);

PressableCard.displayName = 'PressableCard';

// Card Header Component
export interface CardHeaderProps extends ViewProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
  className?: string;
}

export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ title, subtitle, action, avatar, className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('flex-row items-start justify-between mb-4', className)}
        {...props}
      >
        <View className="flex-row items-center flex-1">
          {avatar && <View className="mr-3">{avatar}</View>}
          <View className="flex-1">
            {title && (
              <View className="text-lg font-bold text-gray-900 mb-0.5">
                {title}
              </View>
            )}
            {subtitle && (
              <View className="text-sm text-gray-600">{subtitle}</View>
            )}
            {children}
          </View>
        </View>
        {action && <View className="ml-3">{action}</View>}
      </View>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Footer Component
export interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ children, className, divider = true, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          'mt-4 pt-4',
          divider && 'border-t border-gray-100',
          className
        )}
        {...props}
      >
        {children}
      </View>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Interactive Card with hover state
export interface InteractiveCardProps extends PressableCardProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
}

export const InteractiveCard = React.forwardRef<View, InteractiveCardProps>(
  (
    {
      leftIcon,
      rightIcon,
      title,
      description,
      badge,
      variant = 'elevated',
      ...props
    },
    ref
  ) => {
    return (
      <PressableCard ref={ref} variant={variant} {...props}>
        <View className="flex-row items-center">
          {leftIcon && (
            <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
              {leftIcon}
            </View>
          )}
          
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className="text-base font-bold text-gray-900 flex-1">
                {title}
              </View>
              {badge && <View className="ml-2">{badge}</View>}
            </View>
            
            {description && (
              <View className="text-sm text-gray-600">{description}</View>
            )}
          </View>

          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>
      </PressableCard>
    );
  }
);

InteractiveCard.displayName = 'InteractiveCard';