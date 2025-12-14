// components/ui/Button.tsx
import { cn } from '@/utils/cn';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    Text,
    View,
} from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
  hapticFeedback?: boolean;
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
      onPress,
      ...props
    },
    ref
  ) => {
    const handlePress = (event: any) => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(event);
    };

    const baseStyles = 'flex-row items-center justify-center rounded-lg';

    const variantStyles = {
      primary: 'bg-primary-600 active:bg-primary-700',
      secondary: 'bg-secondary-600 active:bg-secondary-700',
      outline: 'bg-transparent border-2 border-primary-600 active:bg-primary-50',
      ghost: 'bg-transparent active:bg-gray-100',
      danger: 'bg-error-600 active:bg-error-700',
    };

    const sizeStyles = {
      sm: 'px-3 py-2 min-h-[36px]',
      md: 'px-4 py-3 min-h-[44px]',
      lg: 'px-6 py-4 min-h-[52px]',
    };

    const textVariantStyles = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary-600',
      ghost: 'text-gray-900',
      danger: 'text-white',
    };

    const textSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const disabledStyles = isDisabled || isLoading ? 'opacity-50' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
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
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? '#0ea5e9' : '#ffffff'}
          />
        ) : (
          <>
            {leftIcon && <View className="mr-2">{leftIcon}</View>}
            <Text
              className={cn(
                'font-semibold',
                textVariantStyles[variant],
                textSizeStyles[size],
                textClassName
              )}
            >
              {children}
            </Text>
            {rightIcon && <View className="ml-2">{rightIcon}</View>}
          </>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
