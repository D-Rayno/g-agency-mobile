// components/form/PhoneInput.tsx
/**
 * Ultra-Premium Phone Input Component
 * Enhanced with better styling and visual feedback
 */

import { TextInputProps } from '@/types/form';
import { cn } from '@/utils/cn';
import { phoneFieldValidation, validatePhoneNumber } from '@/validations/auth';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { Controller } from 'react-hook-form';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as yup from 'yup';

interface PhoneInputProps extends Omit<TextInputProps, 'keyboardType'> {
  enableValidation?: boolean;
  validationType?: 'basic' | 'comprehensive';
}

export const PhoneInput: FC<PhoneInputProps> = ({
  control,
  name,
  label,
  helperText,
  placeholder = 'Enter phone number',
  rules = {},
  containerStyle,
  inputStyle,
  labelStyle,
  helperTextStyle,
  errorTextStyle,
  required,
  enableValidation = true,
  validationType = 'comprehensive',
  ...rest
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('+213');
  const [isFocused, setIsFocused] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const inputRef = useRef<TextInput>(null);
  const { top } = useSafeAreaInsets();

  const mergedRules = useMemo(() => {
    if (!enableValidation) return rules;

    const validationRules =
      validationType === 'comprehensive'
        ? {
            validate: async (value: string) => {
              try {
                await phoneFieldValidation.validate(value);
                return true;
              } catch (error) {
                if (error instanceof yup.ValidationError) {
                  return error.message;
                }
                return 'Invalid phone number';
              }
            },
          }
        : {
            validate: (value: string) => {
              if (!value && required) return 'Phone number is required';
              if (value && !validatePhoneNumber(value)) {
                return 'Invalid phone number format';
              }
              return true;
            },
          };

    return {
      ...rules,
      ...validationRules,
      ...(required && {
        required: rules.required || 'Phone number is required',
      }),
    };
  }, [rules, enableValidation, validationType, required]);

  useEffect(() => {
    if (isFocused && inputRef.current && !inputRef.current.isFocused()) {
      inputRef.current.focus();
    }
  }, [isFocused]);

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

  const formatLocalNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    let formatted = digits;
    if (digits.length > 3) formatted = digits.slice(0, 3) + ' ' + digits.slice(3);
    if (digits.length > 6) formatted = formatted.slice(0, 7) + ' ' + formatted.slice(7);
    return formatted;
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={mergedRules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const localValue =
          value?.replace(`${countryCode} `, '') ||
          value?.replace(countryCode, '') ||
          '';

        const handleTextChange = (text: string) => {
          const formattedLocal = formatLocalNumber(text);
          const fullPhoneNumber = `${countryCode} ${formattedLocal}`;
          onChange(fullPhoneNumber);
        };

        const handleCountryChange = (item: any) => {
          setCountryCode(item.dial_code);
          if (localValue) {
            const fullPhoneNumber = `${item.dial_code} ${localValue}`;
            onChange(fullPhoneNumber);
          }
          setShowPicker(false);
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
                'flex-row items-center border-[3px] rounded-2xl bg-gray-50 shadow-sm',
                isFocused && !error ? 'border-primary-500 bg-primary-50/30 shadow-xl shadow-primary-500/20' : 'border-gray-200',
                error && 'border-error-500 bg-error-50/30 shadow-xl shadow-error-500/20'
              )}
            >
              {/* Phone Icon */}
              <View className="ml-5 mr-3">
                <Ionicons 
                  name="call" 
                  size={24} 
                  color={isFocused ? '#4F46E5' : '#6b7280'} 
                />
              </View>

              {/* Enhanced Country Code Picker */}
              <Pressable
                onPress={() => setShowPicker(true)}
                className="flex-row items-center bg-gray-100 px-4 py-3 rounded-xl mr-3 active:bg-gray-200"
              >
                <Text className="text-lg text-gray-900 font-bold mr-2">
                  {countryCode}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#6b7280" />
              </Pressable>

              {/* Phone Number Input */}
              <TextInput
                ref={inputRef}
                className={cn('flex-1 py-5 pr-5 text-lg font-semibold text-gray-900', inputStyle)}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={localValue}
                onChangeText={handleTextChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                maxLength={11}
                {...rest}
              />
            </Animated.View>

            {/* Country Picker Modal */}
            <CountryPicker
              show={showPicker}
              pickerButtonOnPress={handleCountryChange}
              onBackdropPress={() => setShowPicker(false)}
              lang="en"
              style={{ modal: { marginTop: top, height: '50%' } }}
              popularCountries={['dz', 'fr']}
              enableModalAvoiding={true}
            />

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
        );
      }}
    />
  );
};

export default PhoneInput;