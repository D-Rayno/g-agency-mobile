// components/ui/Input.tsx
/**
 * Ultra-Premium Input Component
 * Enhanced with better styling, animations, and visual feedback
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Animated,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      inputClassName,
      labelClassName,
      isRequired = false,
      isDisabled = false,
      variant = 'outline',
      size = 'md',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        speed: 50,
      }).start();
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }).start();
      props.onBlur?.(e);
    };

    const variantStyles = {
      default: 'bg-white border-[3px] border-gray-200',
      filled: 'bg-gray-50 border-[3px] border-transparent',
      outline: 'bg-gray-50 border-[3px] border-gray-200',
    };

    const sizeStyles = {
      sm: 'px-4 py-3 min-h-[44px] text-sm',
      md: 'px-5 py-4 min-h-[52px] text-base',
      lg: 'px-6 py-5 min-h-[60px] text-lg',
    };

    const focusedStyles = isFocused && !error
      ? 'border-primary-500 bg-primary-50/30 shadow-xl shadow-primary-500/20'
      : '';
    const errorStyles = error
      ? 'border-error-500 bg-error-50/30 shadow-xl shadow-error-500/20'
      : '';
    const disabledStyles = isDisabled ? 'opacity-40 bg-gray-100' : '';

    return (
      <View className={cn('w-full', containerClassName)}>
        {label && (
          <Text
            className={cn(
              'text-sm font-black text-gray-700 uppercase tracking-widest mb-3',
              labelClassName
            )}
          >
            {label}
            {isRequired && <Text className="text-error-600 ml-1">*</Text>}
          </Text>
        )}

        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="relative"
        >
          {leftIcon && (
            <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={ref}
            editable={!isDisabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#9ca3af"
            className={cn(
              'rounded-2xl font-semibold text-gray-900',
              variantStyles[variant],
              sizeStyles[size],
              focusedStyles,
              errorStyles,
              disabledStyles,
              leftIcon && 'pl-14',
              rightIcon && 'pr-14',
              inputClassName
            )}
            {...props}
          />

          {rightIcon && (
            <View className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightIcon}
            </View>
          )}
        </Animated.View>

        {error && (
          <View className="flex-row items-center mt-3 bg-error-50 px-4 py-3 rounded-xl border-2 border-error-200">
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text className="text-sm text-error-700 ml-2 font-bold flex-1">
              {error}
            </Text>
          </View>
        )}

        {helperText && !error && (
          <Text className="text-sm text-gray-600 mt-2 font-medium">
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
