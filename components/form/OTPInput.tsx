// components/form/OTPInput.tsx
/**
 * Enhanced OTP Input Component (6-digit code entry)
 * Modern design with smooth animations and refined styling
 */

import { TextInputProps } from '@/types/form';
import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Animated, Text, TextInput, View } from 'react-native';

type OTPInputProps = Omit<TextInputProps, 'multiline' | 'numberOfLines'> & {
  length?: number;
  onComplete?: (otp: string) => void;
};

export const OTPInput: React.FC<OTPInputProps> = ({
  control,
  name,
  label,
  helperText,
  rules,
  containerStyle,
  labelStyle,
  helperTextStyle,
  errorTextStyle,
  required,
  length = 6,
  onComplete,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const scaleAnims = useRef(
    Array.from({ length }, () => new Animated.Value(1))
  ).current;

  const handleChangeText = (
    text: string,
    index: number,
    onChange: (value: string) => void,
    currentValue: string
  ) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const otpArray = currentValue ? currentValue.split('') : Array(length).fill('');

    if (numericText.length > 0) {
      otpArray[index] = numericText[numericText.length - 1];
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      otpArray[index] = '';
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    const newValue = otpArray.join('');
    onChange(newValue);

    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyPress = (
    key: string,
    index: number,
    onChange: (value: string) => void,
    currentValue: string
  ) => {
    if (key === 'Backspace') {
      const otpArray = currentValue ? currentValue.split('') : Array(length).fill('');

      if (otpArray[index]) {
        otpArray[index] = '';
        onChange(otpArray.join(''));
      } else if (index > 0) {
        otpArray[index - 1] = '';
        onChange(otpArray.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    Animated.spring(scaleAnims[index], {
      toValue: 1.05,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handleBlur = (index: number) => {
    if (focusedIndex === index) {
      setFocusedIndex(null);
    }
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={containerStyle}>
          {/* Label */}
          {label && (
            <View className="flex-row items-center mb-3">
              <Text className={cn('text-sm font-semibold text-gray-700', labelStyle)}>
                {label}
              </Text>
              {required && <Text className="text-rose-600 ml-1">*</Text>}
            </View>
          )}

          {/* OTP Inputs */}
          <View className="flex-row justify-between gap-2">
            {Array.from({ length }, (_, index) => {
              const hasValue = value && value[index];
              const isFocused = focusedIndex === index;

              return (
                <Animated.View
                  key={index}
                  style={{ transform: [{ scale: scaleAnims[index] }] }}
                  className="flex-1"
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    className={cn(
                      'h-14 border-2 rounded-xl text-center text-xl font-semibold bg-white',
                      isFocused && !error
                        ? 'border-indigo-600 bg-indigo-50/30'
                        : 'border-gray-200',
                      error && 'border-rose-500 bg-rose-50/30',
                      hasValue && !isFocused && !error && 'border-indigo-400'
                    )}
                    style={{ 
                      color: '#1F2937',
                      shadowColor: isFocused ? (error ? '#f43f5e' : '#6366f1') : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isFocused ? 0.15 : 0,
                      shadowRadius: 8,
                      elevation: isFocused ? 3 : 0,
                    }}
                    value={value && value[index] ? value[index] : ''}
                    onChangeText={(text) =>
                      handleChangeText(text, index, onChange, value || '')
                    }
                    onKeyPress={({ nativeEvent }) => {
                      handleKeyPress(nativeEvent.key, index, onChange, value || '');
                    }}
                    onFocus={() => handleFocus(index)}
                    onBlur={() => handleBlur(index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                  />
                </Animated.View>
              );
            })}
          </View>

          {/* Helper Text */}
          {!error && helperText && (
            <Text className={cn('text-sm text-gray-500 mt-2.5 text-center font-normal', helperTextStyle)}>
              {helperText}
            </Text>
          )}

          {/* Error Text */}
          {error && (
            <View className="flex-row items-center mt-2.5 px-3 py-2 bg-rose-50 rounded-lg border border-rose-200">
              <Ionicons name="alert-circle" size={16} color="#f43f5e" />
              <Text className={cn('text-sm text-rose-700 ml-2 font-medium flex-1', errorTextStyle)}>
                {error.message}
              </Text>
            </View>
          )}
        </View>
      )}
    />
  );
};

export default OTPInput;