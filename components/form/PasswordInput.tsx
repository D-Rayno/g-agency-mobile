// components/form/PasswordInput.tsx
/**
 * Ultra-Premium Password Input Component
 * Enhanced with better styling and visual feedback
 */

import type { BaseInputProps } from '@/types/form';
import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';

interface PasswordInputProps extends Omit<BaseInputProps, 'control'> {
  placeholder?: string;
  control?: any;
  icon?: React.ReactNode;
}

export const PasswordInput = memo(
  ({
    control: propsControl,
    name,
    label,
    helperText,
    rules = {},
    containerStyle,
    labelStyle,
    helperTextStyle,
    errorTextStyle,
    required,
    placeholder,
    icon,
  }: PasswordInputProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));

    const formContext = useFormContext();
    const control = propsControl || formContext?.control;

    if (!control) {
      console.warn(
        'PasswordInput: control prop is missing and no FormProvider found.'
      );
      return null;
    }

    const handleFocus = () => {
      setIsFocused(true);
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        speed: 50,
      }).start();
    };

    const handleBlur = (onBlur: () => void) => {
      setIsFocused(false);
      onBlur();
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }).start();
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <Controller
        control={control}
        name={name}
        rules={{
          ...rules,
          required: required ? 'This field is required' : rules?.required,
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View style={containerStyle}>
            {/* Enhanced Label */}
            {label && (
              <View className="flex-row items-center mb-3">
                <Text className={cn('text-sm font-black text-gray-700 uppercase tracking-widest', labelStyle)}>
                  {label}
                </Text>
                {required && <Text className="text-error-600 ml-1 text-base">*</Text>}
              </View>
            )}

            {/* Enhanced Input Container */}
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className={cn(
                'flex-row items-center border-[3px] rounded-2xl bg-gray-50 px-5 shadow-sm',
                isFocused && !error ? 'border-primary-500 bg-primary-50/30 shadow-xl shadow-primary-500/20' : 'border-gray-200',
                error && 'border-error-500 bg-error-50/30 shadow-xl shadow-error-500/20'
              )}
            >
              {/* Left Icon */}
              {icon && <View className="mr-4">{icon}</View>}

              {/* Text Input */}
              <TextInput
                className="flex-1 text-gray-900 text-lg py-5 font-semibold"
                onChangeText={onChange}
                onBlur={() => handleBlur(onBlur)}
                onFocus={handleFocus}
                value={value}
                secureTextEntry={!isPasswordVisible}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />

              {/* Enhanced Toggle Visibility Button */}
              <Pressable
                onPress={togglePasswordVisibility}
                className="p-3 ml-2 rounded-xl active:bg-gray-100"
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={24}
                  color={isFocused ? '#4F46E5' : '#6B7280'}
                />
              </Pressable>
            </Animated.View>

            {/* Enhanced Error Display */}
            {error && (
              <View className="flex-row items-center mt-3 bg-error-50 px-4 py-3 rounded-xl border-2 border-error-200">
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text className={cn('text-sm text-error-700 ml-2 font-bold flex-1', errorTextStyle)}>
                  {error.message}
                </Text>
              </View>
            )}

            {/* Helper Text */}
            {!error && helperText && (
              <Text className={cn('text-sm text-gray-600 mt-2 font-medium', helperTextStyle)}>
                {helperText}
              </Text>
            )}
          </View>
        )}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
