
// components/form/PasswordInput.tsx
import { useTheme } from "@/hooks/use-theme";
import type { BaseInputProps } from "@/types/form";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
    const { colors, typography, spacing } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // Use provided control or fall back to context
    const formContext = useFormContext();
    const control = propsControl || formContext?.control;

    if (!control) {
      console.warn("PasswordInput: control prop is missing and no FormProvider found.");
      return null;
    }

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
        borderColor: isFocused ? colors.primary : colors.border,
        borderRadius: 8,
        backgroundColor: colors.card,
        paddingHorizontal: 12,
      },
      input: {
        flex: 1,
        color: colors.text,
        fontSize: typography.body.fontSize,
        paddingVertical: 10,
        height: 48, // Ensure consistent height
        marginLeft: icon ? 8 : 0,
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
      iconContainer: {
        padding: 4,
      },
    });

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <Controller
        control={control}
        name={name}
        rules={{
          ...rules,
          required: required ? "This field is required" : rules?.required,
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
              {icon}
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                onBlur={() => {
                  onBlur();
                  setIsFocused(false);
                }}
                onFocus={() => setIsFocused(true)}
                value={value}
                secureTextEntry={!isPasswordVisible}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.iconContainer}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>

            {error && (
              <Text style={[styles.errorText, errorTextStyle]}>
                {error.message}
              </Text>
            )}
            {!error && helperText && (
              <Text style={[styles.helperText, helperTextStyle]}>
                {helperText}
              </Text>
            )}
          </View>
        )}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
