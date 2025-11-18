// components/date.tsx

import { useTheme } from "@/hooks/use-theme";
import type { BaseInputProps } from "@/types/form";
import { dateSchema, dateSchemaDetailed, requiredDateSchema } from "@/validations/date";
import { memo, useCallback, useMemo } from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import MaskInput from "react-native-mask-input";
import * as yup from 'yup';

// Mask with ranges for days (01–31) and months (01–12)
const DATE_MASK = [
  /\d/,
  /\d/,
  "/", // DD
  /\d/,
  /\d/,
  "/", // MM
  /\d/,
  /\d/,
  /\d/,
  /\d/, // YYYY
];

interface DateInputProps extends BaseInputProps {
  validationType?: 'optional' | 'required' | 'detailed';
}

// CRITICAL: Stable MaskInput component to prevent recreation
const StableMaskInput = memo(
  ({
    value,
    onChangeText,
    placeholder,
    placeholderTextColor,
    keyboardType,
    style,
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
        style={style}
        {...restProps}
      />
    );
  }
);

StableMaskInput.displayName = "StableMaskInput";

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
    const { colors, typography } = useTheme();

    // Get appropriate validation schema based on type
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

    // Merge custom rules with validation schema
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
        // If required is explicitly set, add required validation
        ...(required && {
          required: rules.required || 'This field is required'
        }),
      };
    }, [rules, validationSchema, required]);

    // CRITICAL: Create stable styles with useMemo
    const styles = useMemo(
      () =>
        StyleSheet.create({
          label: {
            marginBottom: 6,
            fontSize: typography.body.fontSize,
            fontWeight: typography.body.fontWeight,
            color: colors.text,
          },
          inputContainer: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.card,
          },
          input: {
            color: colors.text,
            fontSize: typography.body.fontSize,
            paddingVertical: 10,
            paddingHorizontal: 12,
          },
          helperText: {
            fontSize: typography.caption.fontSize,
            color: colors.muted,
            marginTop: 4,
          },
          errorText: {
            color: colors.danger,
            fontSize: typography.caption.fontSize,
            marginTop: 4,
          },
          required: {
            color: colors.danger,
            marginLeft: 4,
          },
          labelContainer: {
            flexDirection: "row",
            alignItems: "center",
          },
        }),
      [
        colors.text,
        colors.border,
        colors.card,
        colors.muted,
        colors.danger,
        typography.body.fontSize,
        typography.body.fontWeight,
        typography.caption.fontSize,
      ]
    );

    // CRITICAL: Stable render function with minimal dependencies
    const renderInput = useCallback(
      ({ field: { onChange, value }, fieldState: { error } }: any) => {
        const displayValue = value ? value.split("-").reverse().join("/") : "";

        const handleChange = (masked: string) => {
          if (masked.length === 10) {
            const [day, month, year] = masked.split("/");
            const date = `${year}-${month}-${day}`;
            onChange(date);
          } else {
            onChange(masked);
          }
        };

        return (
          <View style={containerStyle}>
            {label && (
              <View style={styles.labelContainer}>
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
              <StableMaskInput
                value={displayValue}
                onChangeText={handleChange}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {error && <Text style={styles.errorText}>{error.message}</Text>}
            {!error && helperText && (
              <Text style={styles.helperText}>{helperText}</Text>
            )}
          </View>
        );
      },
      [
        containerStyle,
        label,
        styles,
        labelStyle,
        required,
        colors.danger,
        colors.muted,
        helperText,
      ]
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

DateInput.displayName = "DateInput";