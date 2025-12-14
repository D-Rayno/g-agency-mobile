// components/form/OTPInput.tsx
/**
 * OTP Input Component (6-digit code entry)
 * Pure NativeWind styling - no theme hooks
 */

import { TextInputProps } from '@/types/form';
import { cn } from '@/utils/cn';
import React, { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

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

  const handleChangeText = (
    text: string,
    index: number,
    onChange: (value: string) => void,
    currentValue: string
  ) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');

    const otpArray = currentValue ? currentValue.split('') : Array(length).fill('');

    if (numericText.length > 0) {
      // Set the digit at current index
      otpArray[index] = numericText[numericText.length - 1];

      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // Clear current digit
      otpArray[index] = '';

      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    const newValue = otpArray.join('');
    onChange(newValue);

    // Check if OTP is complete
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
        // Clear current digit
        otpArray[index] = '';
        onChange(otpArray.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        otpArray[index - 1] = '';
        onChange(otpArray.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
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
            <View className="flex-row items-center">
              <Text className={cn('text-base font-normal text-gray-800 mb-2', labelStyle)}>
                {label}
              </Text>
              {required && <Text className="text-error-600 ml-1">*</Text>}
            </View>
          )}

          {/* OTP Inputs */}
          <View className="flex-row justify-between gap-2">
            {Array.from({ length }, (_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                className={cn(
                  'flex-1 h-14 border-2 rounded-lg text-center text-xl font-semibold bg-white',
                  focusedIndex === index && !error
                    ? 'border-primary-500'
                    : 'border-gray-300',
                  error && 'border-error-600'
                )}
                style={{ color: '#1F2937' }}
                value={value && value[index] ? value[index] : ''}
                onChangeText={(text) =>
                  handleChangeText(text, index, onChange, value || '')
                }
                onKeyPress={({ nativeEvent }) => {
                  handleKeyPress(nativeEvent.key, index, onChange, value || '');
                }}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
              />
            ))}
          </View>

          {/* Helper Text */}
          {!error && helperText && (
            <Text className={cn('text-sm text-gray-500 mt-1 text-center', helperTextStyle)}>
              {helperText}
            </Text>
          )}

          {/* Error Text */}
          {error && (
            <Text className={cn('text-sm text-error-600 mt-1 text-center', errorTextStyle)}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

export default OTPInput;
