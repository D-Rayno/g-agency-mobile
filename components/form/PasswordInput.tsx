// components/form/PasswordInput.tsx
/**
 * Enhanced Password Input Component
 * Modern design with refined interactions and elegant styling
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
    const [borderAnim] = useState(new Animated.Value(0));

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
      Animated.spring(borderAnim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 12,
        bounciness: 8,
      }).start();
    };

    const handleBlur = (onBlur: () => void) => {
      setIsFocused(false);
      onBlur();
      Animated.spring(borderAnim, {
        toValue: 0,
        useNativeDriver: false,
        speed: 12,
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
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          const borderColor = borderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: error ? ['#fca5a5', '#ef4444'] : ['#e5e7eb', '#6366f1'],
          });

          return (
            <View style={containerStyle}>
              {/* Label */}
              {label && (
                <View className="flex-row items-center mb-2">
                  <Text className={cn('text-sm font-semibold text-gray-700', labelStyle)}>
                    {label}
                  </Text>
                  {required && <Text className="text-rose-600 ml-1">*</Text>}
                </View>
              )}

              {/* Input Container */}
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
                  'flex-row items-center border-2 rounded-xl bg-white px-4',
                  isFocused && !error && 'bg-indigo-50/30',
                  error && 'border-rose-500 bg-rose-50/30'
                )}
              >
                {/* Left Icon */}
                {icon && <View className="mr-3">{icon}</View>}

                {/* Text Input */}
                <TextInput
                  className="flex-1 text-gray-900 text-base py-3 font-medium"
                  onChangeText={onChange}
                  onBlur={() => handleBlur(onBlur)}
                  onFocus={handleFocus}
                  value={value}
                  secureTextEntry={!isPasswordVisible}
                  placeholder={placeholder}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                />

                {/* Toggle Visibility Button */}
                <Pressable
                  onPress={togglePasswordVisibility}
                  className="p-2 ml-2 rounded-lg active:bg-gray-100"
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={isFocused ? '#6366f1' : '#6b7280'}
                  />
                </Pressable>
              </Animated.View>

              {/* Error Display */}
              {error && (
                <View className="flex-row items-center mt-2 px-3 py-2 bg-rose-50 rounded-lg border border-rose-200">
                  <Ionicons name="alert-circle" size={16} color="#f43f5e" />
                  <Text className={cn('text-sm text-rose-700 ml-2 font-medium flex-1', errorTextStyle)}>
                    {error.message}
                  </Text>
                </View>
              )}

              {/* Helper Text */}
              {!error && helperText && (
                <Text className={cn('text-sm text-gray-500 mt-2 font-normal', helperTextStyle)}>
                  {helperText}
                </Text>
              )}
            </View>
          );
        }}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;