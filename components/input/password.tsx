// components/input/password.tsx - Updated with Lottie Animation
import PasswordToggleButton from "@/components/button/toggle-password"; // Adjust path as needed
import { useTheme } from "@/hooks/use-theme";
import { TextInputProps } from "@/types/form";
import type { FC } from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useController } from "react-hook-form";
import {
  Platform,
  TextInput as RNInput,
  StyleSheet,
  Text,
  View,
} from "react-native";

let componentInstanceCounter = 0;

const createStyles = (colors: any, typography: any, spacing: any) =>
  StyleSheet.create({
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 0,
      paddingHorizontal: 0,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      fontSize: typography.body.fontSize,
      color: colors.text,
      textAlignVertical: "center",
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    toggleButtonContainer: {
      marginEnd: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: colors.danger,
      marginTop: 4,
      fontSize: typography.caption.fontSize,
    },
    label: {
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight,
      color: colors.text,
    },
    required: {
      color: colors.danger,
      marginLeft: 4,
    },
    helper: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      marginTop: 4,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing?.xs || 4,
    },
  });

const StablePasswordInput = memo(
  forwardRef<
    RNInput,
    {
      onChange: (text: string) => void;
      onBlur: () => void;
      value: string;
      error?: any;
      placeholder: string;
      styles: any;
      colors: any;
      inputStyle?: any;
      errorTextStyle?: any;
      restProps: any;
      fieldName: string;
      autoComplete: "current-password" | "new-password" | "password";
    }
  >(
    (
      {
        onChange,
        onBlur,
        value,
        error,
        placeholder,
        styles,
        colors,
        inputStyle,
        errorTextStyle,
        restProps,
        fieldName,
        autoComplete,
      },
      ref
    ) => {
      const inputRef = useRef<RNInput>(null);
      const [visible, setVisible] = useState(false);

      // CRITICAL: Track focus state to handle autofill overlay interference
      const [isFocused, setIsFocused] = useState(false);
      const focusTimeoutRef = useRef<number>(null);
      const shouldRestoreFocus = useRef(false);
      const { spacing, radius } = useTheme();

      const handleToggleVisibility = useCallback((isVisible: boolean) => {
        setVisible(isVisible);
      }, []);

      const handleChangeText = useCallback(
        (text: string) => {
          onChange(text);
        },
        [onChange, fieldName]
      );

      const handleFocus = useCallback(
        (e: any) => {
          setIsFocused(true);
          shouldRestoreFocus.current = true;

          // Clear any pending focus restoration
          if (focusTimeoutRef.current) {
            clearTimeout(focusTimeoutRef.current);
          }

          restProps?.onFocus?.(e);
        },
        [restProps?.onFocus, fieldName]
      );

      const handleBlur = useCallback(
        (e: any) => {
          setIsFocused(false);

          // CRITICAL: Delay the blur to catch if it's caused by autofill overlay
          focusTimeoutRef.current = setTimeout(() => {
            if (shouldRestoreFocus.current && !isFocused) {
              inputRef.current?.focus();
              shouldRestoreFocus.current = false;
            }
          }, 100); // Small delay to detect autofill overlay

          onBlur();
          restProps?.onBlur?.(e);
        },
        [onBlur, restProps?.onBlur, fieldName, isFocused]
      );

      const combinedRef = useCallback(
        (node: RNInput) => {
          inputRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        },
        [ref]
      );

      const dynamicInputWrapperStyle = useMemo(
        () => [
          styles.inputWrapper,
          { borderColor: error ? colors.danger : colors.border },
        ],
        [styles.inputWrapper, error, colors.danger, colors.border]
      );

      return (
        <>
          <View style={dynamicInputWrapperStyle}>
            <RNInput
              ref={combinedRef}
              style={[styles.input, inputStyle]}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              value={value || ""}
              onChangeText={handleChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              secureTextEntry={!visible}
              // CRITICAL: Autofill settings to prevent overlay interference
              autoComplete={autoComplete}
              textContentType={
                autoComplete === "new-password" ? "newPassword" : "password"
              }
              autoCapitalize="none"
              autoCorrect={false}
              // Platform-specific autofill handling
              {...(Platform.OS === "android" && {
                importantForAutofill: "no", // Disable Android autofill overlay
              })}
              {...(Platform.OS === "ios" && {
                passwordRules:
                  autoComplete === "new-password" ? "minlength: 8;" : undefined,
              })}
              {...restProps}
            />
            <View style={styles.toggleButtonContainer}>
              <PasswordToggleButton
                isVisible={visible}
                onToggle={handleToggleVisibility}
                size={20}
                animationSpeed={1.2}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                style={{
                  padding: spacing.sm,
                  backgroundColor: `${error ? colors.danger : '#cccccc'}50`,
                  borderRadius: radius.sm,
                }}
              />
            </View>
          </View>
          {error && (
            <Text style={[styles.errorText, errorTextStyle]}>
              {error.message}
            </Text>
          )}
        </>
      );
    }
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.error?.message === nextProps.error?.message &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.fieldName === nextProps.fieldName &&
      prevProps.autoComplete === nextProps.autoComplete
    );
  }
);

StablePasswordInput.displayName = "StablePasswordInput";

type PasswordInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  autoComplete?: "current-password" | "new-password" | "password";
};

export const PasswordInput: FC<PasswordInputProps> = ({
  control,
  name,
  label,
  helperText,
  placeholder = "Enter password",
  rules = {},
  containerStyle,
  inputStyle,
  labelStyle,
  helperTextStyle,
  errorTextStyle,
  required,
  autoComplete = "current-password",
  ...rest
}) => {
  const { colors, typography, spacing } = useTheme();
  const inputRef = useRef<RNInput>(null);

  const stableRules = useMemo(() => rules, [JSON.stringify(rules)]);

  const { field, fieldState } = useController({
    control,
    name,
    rules: stableRules,
  });

  const styles = useMemo(
    () => createStyles(colors, typography, spacing),
    [colors, typography, spacing]
  );

  const restProps = useMemo(() => {
    const {
      secureTextEntry,
      multiline,
      numberOfLines,
      maxLength,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      editable,
      onFocus,
      onBlur,
      ...filteredRest
    } = rest as any;
    return {
      maxLength,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      editable,
      onFocus,
      onBlur,
    };
  }, [
    rest.maxLength,
    rest.keyboardType,
    rest.autoCapitalize,
    rest.autoCorrect,
    rest.editable,
    rest.onFocus,
    rest.onBlur,
  ]);

  return (
    <View style={containerStyle}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <StablePasswordInput
        ref={inputRef}
        onChange={field.onChange}
        onBlur={field.onBlur}
        value={field.value}
        error={fieldState.error}
        placeholder={placeholder}
        styles={styles}
        colors={colors}
        inputStyle={inputStyle}
        errorTextStyle={errorTextStyle}
        restProps={restProps}
        fieldName={name}
        autoComplete={autoComplete}
      />

      {helperText && (
        <Text style={[styles.helper, helperTextStyle]}>{helperText}</Text>
      )}
    </View>
  );
};

PasswordInput.displayName = "PasswordInput";
