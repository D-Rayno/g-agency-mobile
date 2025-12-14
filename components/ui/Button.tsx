// components/ui/Button.tsx
/**
 * Ultra-Premium Button Component
 * Enhanced with animations, better feedback, and refined styling
 */

import { cn } from '@/utils/cn';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableProps,
  Text,
  View,
} from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
  hapticFeedback?: boolean;
  gradient?: boolean;
  animated?: boolean;
}

export const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      textClassName,
      hapticFeedback = true,
      gradient = false,
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
          toValue: 0.96,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }).start();
      }
    };

    const handlePressOut = () => {
      if (animated) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 8,
        }).start();
      }
    };

    const handlePress = (event: any) => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress?.(event);
    };

    const baseStyles = 'flex-row items-center justify-center rounded-2xl overflow-hidden';

    const variantStyles = {
      primary: 'bg-primary-600 active:bg-primary-700 shadow-xl shadow-primary-500/40',
      secondary: 'bg-secondary-600 active:bg-secondary-700 shadow-xl shadow-secondary-500/40',
      outline: 'bg-transparent border-[3px] border-primary-600 active:bg-primary-50 active:border-primary-700',
      ghost: 'bg-transparent active:bg-gray-100',
      danger: 'bg-error-600 active:bg-error-700 shadow-xl shadow-error-500/40',
      success: 'bg-success-600 active:bg-success-700 shadow-xl shadow-success-500/40',
    };

    const sizeStyles = {
      sm: 'px-5 py-3 min-h-[44px]',
      md: 'px-7 py-4 min-h-[52px]',
      lg: 'px-9 py-5 min-h-[60px]',
      xl: 'px-12 py-6 min-h-[68px]',
    };

    const textVariantStyles = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary-700',
      ghost: 'text-gray-900',
      danger: 'text-white',
      success: 'text-white',
    };

    const textSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    const iconSizeMap = {
      sm: 18,
      md: 20,
      lg: 24,
      xl: 28,
    };

    const disabledStyles = isDisabled || isLoading ? 'opacity-40' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    const gradientColors = {
      primary: ['#4F46E5', '#6366f1', '#818cf8'] as const,
      secondary: ['#14B8A6', '#0d9488', '#0f766e'] as const,
      danger: ['#ef4444', '#dc2626', '#b91c1c'] as const,
      success: ['#22c55e', '#16a34a', '#15803d'] as const,
      outline: ['transparent', 'transparent'] as const,
      ghost: ['transparent', 'transparent'] as const,
    };

    const buttonContent = (
      <>
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator
              size="small"
              color={variant === 'outline' || variant === 'ghost' ? '#4F46E5' : '#ffffff'}
            />
            <Text
              className={cn(
                'ml-3 font-bold tracking-wide',
                textVariantStyles[variant],
                textSizeStyles[size],
                textClassName
              )}
            >
              Loading...
            </Text>
          </View>
        ) : (
          <>
            {leftIcon && <View className="mr-3">{leftIcon}</View>}
            <Text
              className={cn(
                'font-extrabold tracking-wide',
                textVariantStyles[variant],
                textSizeStyles[size],
                textClassName
              )}
            >
              {children}
            </Text>
            {rightIcon && <View className="ml-3">{rightIcon}</View>}
          </>
        )}
      </>
    );

    if (gradient && (variant === 'primary' || variant === 'secondary' || variant === 'danger' || variant === 'success')) {
      return (
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: fullWidth ? '100%' : undefined,
          }}
        >
          <Pressable
            ref={ref}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled || isLoading}
            className={cn(
              baseStyles,
              'shadow-2xl',
              disabledStyles,
              className
            )}
            {...props}
          >
            <LinearGradient
              colors={gradientColors[variant]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={cn(
                'flex-row items-center justify-center w-full',
                sizeStyles[size]
              )}
            >
              {buttonContent}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          width: fullWidth ? '100%' : undefined,
        }}
      >
        <Pressable
          ref={ref}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled || isLoading}
          className={cn(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            disabledStyles,
            widthStyles,
            className
          )}
          {...props}
        >
          {buttonContent}
        </Pressable>
      </Animated.View>
    );
  }
);

Button.displayName = 'Button';
