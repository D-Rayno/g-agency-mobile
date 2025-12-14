// components/form/DateInput.tsx
/**
 * Ultra-Premium Date Input Component
 * Enhanced with better styling and visual feedback
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
    const [scaleAnim] = useState(new Animated.Value(1));

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
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        speed: 50,
      }).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
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

        return (
          <View style={containerStyle}>
            {/* Enhanced Label */}
            {label && (
              <View className="flex-row items-center mb-3">
                <Text className={cn('text-sm font-black text-gray-700 uppercase tracking-widest', labelStyle)}>
                  {label}
                </Text>
                {required && <Text className="text-error-600 ml-1">*</Text>}
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
              {/* Calendar Icon */}
              <View className="mr-4">
                <Ionicons 
                  name="calendar" 
                  size={24} 
                  color={isFocused ? '#4F46E5' : '#6b7280'} 
                />
              </View>

              <StableMaskInput
                value={displayValue}
                onChangeText={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="flex-1 text-gray-900 text-lg py-5 font-semibold"
              />
            </Animated.View>

            {/* Enhanced Error Display */}
            {error && (
              <View className="flex-row items-center mt-3 bg-error-50 px-4 py-3 rounded-xl border-2 border-error-200">
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text className="text-sm text-error-700 ml-2 font-bold flex-1">
                  {error.message}
                </Text>
              </View>
            )}

            {/* Helper Text */}
            {!error && helperText && (
              <Text className="text-sm text-gray-600 mt-2 font-medium">
                {helperText}
              </Text>
            )}
          </View>
        );
      },
      [containerStyle, label, labelStyle, required, helperText, isFocused]
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