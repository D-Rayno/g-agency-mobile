// components/ui/Input.tsx
/**
 * Enhanced Premium Input Component
 * Modern design with refined styling and smooth interactions
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
    const [borderAnim] = useState(new Animated.Value(0));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      Animated.spring(borderAnim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 12,
        bounciness: 8,
      }).start();
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      Animated.spring(borderAnim, {
        toValue: 0,
        useNativeDriver: false,
        speed: 12,
      }).start();
      props.onBlur?.(e);
    };

    const variantStyles = {
      default: 'bg-white border-2 border-gray-200',
      filled: 'bg-gray-50 border-2 border-transparent',
      outline: 'bg-white border-2 border-gray-200',
    };

    const sizeStyles = {
      sm: 'px-3.5 py-2.5 min-h-[42px] text-sm',
      md: 'px-4 py-3 min-h-[48px] text-base',
      lg: 'px-5 py-4 min-h-[56px] text-lg',
    };

    const borderColor = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: error ? ['#fca5a5', '#ef4444'] : ['#e5e7eb', '#6366f1'],
    });

    const focusedStyles = isFocused && !error
      ? 'bg-indigo-50/30'
      : '';
    const errorStyles = error
      ? 'border-rose-500 bg-rose-50/30'
      : '';
    const disabledStyles = isDisabled ? 'opacity-50 bg-gray-100' : '';

    return (
      <View className={cn('w-full', containerClassName)}>
        {label && (
          <Text
            className={cn(
              'text-sm font-semibold text-gray-700 mb-2',
              labelClassName
            )}
          >
            {label}
            {isRequired && <Text className="text-rose-600 ml-1">*</Text>}
          </Text>
        )}

        <Animated.View
          style={{ 
            borderColor,
            shadowColor: isFocused ? (error ? '#ef4444' : '#6366f1') : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isFocused ? 0.1 : 0,
            shadowRadius: 8,
            elevation: isFocused ? 2 : 0,
          }}
          className={cn(
            'rounded-xl relative',
            variantStyles[variant],
            focusedStyles,
            errorStyles,
            disabledStyles
          )}
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
              'font-medium text-gray-900',
              sizeStyles[size],
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
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
          <View className="flex-row items-center mt-2 px-3 py-2 bg-rose-50 rounded-lg border border-rose-200">
            <Ionicons name="alert-circle" size={16} color="#f43f5e" />
            <Text className="text-sm text-rose-700 ml-2 font-medium flex-1">
              {error}
            </Text>
          </View>
        )}

        {helperText && !error && (
          <Text className="text-sm text-gray-500 mt-2 font-normal">
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';