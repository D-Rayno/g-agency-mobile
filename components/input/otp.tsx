// components/input/otp.tsx
import { useTheme } from "@/hooks/use-theme";
import { TextInputProps } from "@/types/form";
import React, { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

type OTPInputProps = Omit<TextInputProps, "multiline" | "numberOfLines"> & {
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
  const { colors, typography, spacing } = useTheme();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const styles = StyleSheet.create({
    label: {
      marginBottom: spacing.sm,
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight,
      color: colors.text,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    otpInput: {
      flex: 1,
      height: 56,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 8,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      backgroundColor: colors.card,
    },
    otpInputFocused: {
      borderColor: colors.primary,
    },
    otpInputError: {
      borderColor: colors.danger,
    },
    helperText: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      marginTop: spacing.xs,
      textAlign: "center",
    },
    errorText: {
      color: colors.danger,
      marginTop: spacing.xs,
      fontSize: typography.caption.fontSize,
      textAlign: "center",
    },
    required: {
      color: colors.danger,
      marginLeft: 4,
    },
  });

  const handleChangeText = (
    text: string,
    index: number,
    onChange: (value: string) => void,
    currentValue: string
  ) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");

    // Create array from current value or empty array
    const otpArray = currentValue
      ? currentValue.split("")
      : Array(length).fill("");

    if (numericText.length > 0) {
      // Set the digit at current index
      otpArray[index] = numericText[numericText.length - 1];

      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // Clear current digit
      otpArray[index] = "";

      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    const newValue = otpArray.join("");
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
    if (key === "Backspace") {
      const otpArray = currentValue
        ? currentValue.split("")
        : Array(length).fill("");

      if (otpArray[index]) {
        // Clear current digit
        otpArray[index] = "";
        onChange(otpArray.join(""));
      } else if (index > 0) {
        // Move to previous input and clear it
        otpArray[index - 1] = "";
        onChange(otpArray.join(""));
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
        <View style={[containerStyle]}>
          {label && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.label, labelStyle]}>{label}</Text>
              {required && <Text style={styles.required}>*</Text>}
            </View>
          )}

          <View style={styles.otpContainer}>
            {Array.from({ length }, (_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpInputFocused,
                  error && styles.otpInputError,
                ]}
                value={value && value[index] ? value[index] : ""}
                onChangeText={(text) =>
                  handleChangeText(text, index, onChange, value || "")
                }
                onKeyPress={({ nativeEvent }) => {
                  handleKeyPress(nativeEvent.key, index, onChange, value || "");
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

          {!error && helperText && (
            <Text style={[styles.helperText, helperTextStyle]}>
              {helperText}
            </Text>
          )}
          {error && (
            <Text style={[styles.errorText, errorTextStyle]}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};
