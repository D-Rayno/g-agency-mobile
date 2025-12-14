// components/ui/Input.tsx
import { cn } from '@/utils/cn';
import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
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

    const variantStyles = {
      default: 'bg-white border border-gray-300',
      filled: 'bg-gray-100 border-0',
      outline: 'bg-transparent border-2 border-gray-300',
    };

    const sizeStyles = {
      sm: 'px-3 py-2 min-h-[36px] text-sm',
      md: 'px-4 py-3 min-h-[44px] text-base',
      lg: 'px-4 py-4 min-h-[52px] text-lg',
    };

    const focusedStyles = isFocused ? 'border-primary-600' : '';
    const errorStyles = error ? 'border-error-600' : '';
    const disabledStyles = isDisabled ? 'opacity-50 bg-gray-100' : '';

    return (
      <View className={cn('w-full', containerClassName)}>
        {label && (
          <Text
            className={cn(
              'text-sm font-medium text-gray-700 mb-1.5',
              labelClassName
            )}
          >
            {label}
            {isRequired && <Text className="text-error-600"> *</Text>}
          </Text>
        )}

        <View className="relative">
          {leftIcon && (
            <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={ref}
            editable={!isDisabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor="#9ca3af"
            className={cn(
              'rounded-lg',
              variantStyles[variant],
              sizeStyles[size],
              focusedStyles,
              errorStyles,
              disabledStyles,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              inputClassName
            )}
            {...props}
          />

          {rightIcon && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </View>
          )}
        </View>

        {error && (
          <Text className="text-xs text-error-600 mt-1">{error}</Text>
        )}

        {helperText && !error && (
          <Text className="text-xs text-gray-500 mt-1">{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// Password Input Component
export interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry'> {}

export const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        secureTextEntry={!showPassword}
        rightIcon={
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-1"
          >
            <Text className="text-sm text-gray-600">
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
