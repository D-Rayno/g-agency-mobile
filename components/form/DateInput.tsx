// components/form/DateInput.tsx
/**
 * Enhanced Date Input Component
 * Modern design with refined interactions and elegant styling
 */

import type { BaseInputProps } from '@/types/form';
import { cn } from '@/utils/cn';
import {
  dateSchema,
  dateSchemaDetailed,
  requiredDateSchema,
} from '@/validations/date';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Animated, Text, View } from 'react-native';
import MaskInput from 'react-native-mask-input';
import * as yup from 'yup';

const DATE_MASK = [
  /\d/,
  /\d/,
  '/',
  /\d/,
  /\d/,
  '/',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

interface DateInputProps extends BaseInputProps {
  validationType?: 'optional' | 'required' | 'detailed';
}

const StableMaskInput = memo(
  ({
    value,
    onChangeText,
    placeholder,
    placeholderTextColor,
    keyboardType,
    className,
    onFocus,
    onBlur,
    ...restProps
  }: any) => {
    return (
      <MaskInput
        value={value}
        mask={DATE_MASK}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        className={className}
        onFocus={onFocus}
        onBlur={onBlur}
        {...restProps}
      />
    );
  }
);

StableMaskInput.displayName = 'StableMaskInput';

export const DateInput = memo(
  ({
    control,
    name,
    label,
    helperText,
    rules = {},
    containerStyle,
    labelStyle,
    required,
    validationType = 'optional',
  }: DateInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [borderAnim] = useState(new Animated.Value(0));

    const validationSchema = useMemo(() => {
      switch (validationType) {
        case 'required':
          return requiredDateSchema;
        case 'detailed':
          return dateSchemaDetailed;
        case 'optional':
        default:
          return dateSchema;
      }
    }, [validationType]);

    const mergedRules = useMemo(() => {
      const schemaValidation = {
        validate: async (value: string) => {
          try {
            await validationSchema.validate(value);
            return true;
          } catch (error) {
            if (error instanceof yup.ValidationError) {
              return error.message;
            }
            return 'Invalid date';
          }
        },
      };

      return {
        ...rules,
        ...schemaValidation,
        ...(required && {
          required: rules.required || 'This field is required',
        }),
      };
    }, [rules, validationSchema, required]);

    const handleFocus = () => {
      setIsFocused(true);
      Animated.spring(borderAnim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 12,
        bounciness: 8,
      }).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.spring(borderAnim, {
        toValue: 0,
        useNativeDriver: false,
        speed: 12,
      }).start();
    };

    const renderInput = useCallback(
      ({ field: { onChange, value }, fieldState: { error } }: any) => {
        const displayValue = value ? value.split('-').reverse().join('/') : '';

        const handleChange = (masked: string) => {
          if (masked.length === 10) {
            const [day, month, year] = masked.split('/');
            const date = `${year}-${month}-${day}`;
            onChange(date);
          } else {
            onChange(masked);
          }
        };

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
              {/* Calendar Icon */}
              <View className="mr-3">
                <Ionicons 
                  name="calendar-outline" 
                  size={22} 
                  color={isFocused ? '#6366f1' : '#6b7280'} 
                />
              </View>

              <StableMaskInput
                value={displayValue}
                onChangeText={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="flex-1 text-gray-900 text-base py-3 font-medium"
              />
            </Animated.View>

            {/* Error Display */}
            {error && (
              <View className="flex-row items-center mt-2 px-3 py-2 bg-rose-50 rounded-lg border border-rose-200">
                <Ionicons name="alert-circle" size={16} color="#f43f5e" />
                <Text className="text-sm text-rose-700 ml-2 font-medium flex-1">
                  {error.message}
                </Text>
              </View>
            )}

            {/* Helper Text */}
            {!error && helperText && (
              <Text className="text-sm text-gray-500 mt-2 font-normal">
                {helperText}
              </Text>
            )}
          </View>
        );
      },
      [containerStyle, label, labelStyle, required, helperText, isFocused, borderAnim]
    );

    return (
      <Controller
        control={control}
        name={name}
        rules={mergedRules}
        render={renderInput}
      />
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;