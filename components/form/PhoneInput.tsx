// components/form/PhoneInput.tsx
/**
 * Enhanced Phone Input Component
 * Modern design with refined styling and smooth interactions
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
  const [borderAnim] = useState(new Animated.Value(0));
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
                'flex-row items-center border-2 rounded-xl bg-white',
                isFocused && !error && 'bg-indigo-50/30',
                error && 'border-rose-500 bg-rose-50/30'
              )}
            >
              {/* Phone Icon */}
              <View className="ml-4 mr-3">
                <Ionicons 
                  name="call-outline" 
                  size={22} 
                  color={isFocused ? '#6366f1' : '#6b7280'} 
                />
              </View>

              {/* Country Code Picker */}
              <Pressable
                onPress={() => setShowPicker(true)}
                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg mr-3 active:bg-gray-200"
              >
                <Text className="text-base text-gray-900 font-semibold mr-1.5">
                  {countryCode}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </Pressable>

              {/* Phone Number Input */}
              <TextInput
                ref={inputRef}
                className={cn('flex-1 py-3 pr-4 text-base font-medium text-gray-900', inputStyle)}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
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
};

export default PhoneInput;