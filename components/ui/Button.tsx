// components/ui/Button.tsx
/**
 * Enhanced Premium Button Component
 * Modern design with refined interactions and sophisticated styling
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
      gradient = true,
      animated = true,
      onPress,
      ...props
    },
    ref
  ) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [glowAnim] = useState(new Animated.Value(0));

    const handlePressIn = () => {
      if (animated) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            speed: 50,
            bounciness: 5,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    const handlePressOut = () => {
      if (animated) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
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
      primary: 'bg-indigo-600 active:bg-indigo-700',
      secondary: 'bg-teal-600 active:bg-teal-700',
      outline: 'bg-transparent border-2 border-indigo-600 active:bg-indigo-50',
      ghost: 'bg-transparent active:bg-gray-100',
      danger: 'bg-rose-600 active:bg-rose-700',
      success: 'bg-green-600 active:bg-green-700',
    };

    const shadowStyles = {
      primary: 'shadow-lg shadow-indigo-500/20',
      secondary: 'shadow-lg shadow-teal-500/20',
      outline: 'shadow-sm',
      ghost: '',
      danger: 'shadow-lg shadow-rose-500/20',
      success: 'shadow-lg shadow-green-500/20',
    };

    const sizeStyles = {
      sm: 'px-4 py-2.5 min-h-[40px]',
      md: 'px-6 py-3.5 min-h-[48px]',
      lg: 'px-8 py-4 min-h-[56px]',
      xl: 'px-10 py-5 min-h-[64px]',
    };

    const textVariantStyles = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-indigo-700',
      ghost: 'text-gray-700',
      danger: 'text-white',
      success: 'text-white',
    };

    const textSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    const disabledStyles = isDisabled || isLoading ? 'opacity-50' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    const gradientColors = {
      primary: ['#6366f1', '#4f46e5', '#4338ca'] as const,
      secondary: ['#14b8a6', '#0d9488', '#0f766e'] as const,
      danger: ['#f43f5e', '#e11d48', '#be123c'] as const,
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
              color={variant === 'outline' || variant === 'ghost' ? '#4f46e5' : '#ffffff'}
            />
            <Text
              className={cn(
                'ml-2.5 font-semibold',
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
            {leftIcon && <View className="mr-2.5">{leftIcon}</View>}
            <Text
              className={cn(
                'font-semibold tracking-tight',
                textVariantStyles[variant],
                textSizeStyles[size],
                textClassName
              )}
            >
              {children}
            </Text>
            {rightIcon && <View className="ml-2.5">{rightIcon}</View>}
          </>
        )}
      </>
    );

    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.3],
    });

    if (gradient && (variant === 'primary' || variant === 'secondary' || variant === 'danger' || variant === 'success')) {
      return (
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: fullWidth ? '100%' : undefined,
          }}
        >
          <View className={cn('relative', widthStyles)}>
            {/* Glow effect */}
            <Animated.View
              className="absolute inset-0 rounded-2xl"
              style={{
                opacity: glowOpacity,
                backgroundColor: variant === 'primary' ? '#6366f1' : 
                                variant === 'secondary' ? '#10b981' :
                                variant === 'danger' ? '#f43f5e' : '#22c55e',
                transform: [{ scale: 1.05 }],
              }}
            />
            
            <Pressable
              ref={ref}
              onPress={handlePress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isDisabled || isLoading}
              className={cn(
                baseStyles,
                shadowStyles[variant],
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
          </View>
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
            shadowStyles[variant],
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