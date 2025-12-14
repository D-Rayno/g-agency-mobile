// components/PhoneInput.tsx
import { useTheme } from "@/hooks/use-theme";
import { TextInputProps } from "@/types/form";
import { phoneFieldValidation, validatePhoneNumber } from "@/validations/auth";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { CountryPicker } from "react-native-country-codes-picker"; // New import
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as yup from 'yup';

interface PhoneInputProps extends Omit<TextInputProps, "keyboardType"> {
  enableValidation?: boolean;
  validationType?: 'basic' | 'comprehensive';
}

export const PhoneInput: FC<PhoneInputProps> = ({
  control,
  name,
  label,
  helperText,
  placeholder = "Enter phone number",
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
  const [countryCode, setCountryCode] = useState("+213"); // Default to Algeria (+213)
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { colors, spacing, typography } = useTheme();
  const { top } = useSafeAreaInsets();

  // Merge custom rules with validation schema
  const mergedRules = useMemo(() => {
    if (!enableValidation) return rules;

    const validationRules = validationType === 'comprehensive' ? {
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
    } : {
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
      // If required is explicitly set, add required validation
      ...(required && {
        required: rules.required || 'Phone number is required'
      }),
    };
  }, [rules, enableValidation, validationType, required]);

  const styles = StyleSheet.create({
    label: {
      marginBottom: spacing.xs,
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight,
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.card,
    },
    code: {
      marginStart: spacing.sm,
      fontSize: typography.body.fontSize,
      color: colors.text,
    },
    input: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight,
      color: colors.text,
    },
    errorInput: {
      borderColor: colors.danger,
    },
    helperText: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      marginTop: spacing.xs,
    },
    errorText: {
      color: colors.danger,
      marginTop: spacing.xs,
      fontSize: typography.caption.fontSize,
      fontWeight: typography.caption.fontWeight,
    },
    required: {
      color: colors.danger,
      marginStart: spacing.xs,
    },
  });

  // Persist focus after re-renders (e.g., when error changes)
  useEffect(() => {
    if (isFocused && inputRef.current && !inputRef.current.isFocused()) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  // Format local number (9 digits max, spaced for readability)
  const formatLocalNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    let formatted = digits;
    if (digits.length > 3) formatted = digits.slice(0, 3) + " " + digits.slice(3);
    if (digits.length > 6) formatted = formatted.slice(0, 7) + " " + formatted.slice(7);
    return formatted;
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={mergedRules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const localValue =
          value?.replace(`${countryCode} `, "") ||
          value?.replace(countryCode, "") ||
          "";

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
          <View style={[containerStyle]}>
            {label && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.label, labelStyle]}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
              </View>
            )}

            <View
              style={[
                styles.inputContainer,
                error && { borderColor: colors.danger },
              ]}
            >
              <Text
                style={styles.code}
                onPress={() => setShowPicker(true)}
              >
                {countryCode}
              </Text>

              <TextInput
                ref={inputRef}
                style={[styles.input, inputStyle]}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                value={localValue}
                onChangeText={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={11} // "XXX XXX XXX" (9 digits + 2 spaces)
                {...rest}
              />
            </View>

            <CountryPicker
              show={showPicker}
              pickerButtonOnPress={handleCountryChange}
              onBackdropPress={() => setShowPicker(false)}
              lang="en" // Adjust as needed
              style={{ modal: { marginTop: top, height: "50%" } }}
              // Optional: excludedCountries={['US', 'CA']} to exclude countries
              popularCountries={['dz', 'fr']}
              enableModalAvoiding={true}
            />

            {!error && helperText && (
              <Text style={[styles.helperText, helperTextStyle]}>{helperText}</Text>
            )}
            {error && (
              <Text style={[styles.errorText, errorTextStyle]}>{error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
};

export default PhoneInput;