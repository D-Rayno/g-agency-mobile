// components/input/text.tsx
import { useTheme } from "@/hooks/use-theme";
import { TextInputProps } from "@/types/form";
import type { FC } from "react";
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Controller, ControllerRenderProps, FieldError } from "react-hook-form";
import { TextInput as RNInput, Text, View } from "react-native";

// Track component identity
let componentInstanceCounter = 0;

const StableNativeInput = memo(forwardRef<RNInput, {
  field: ControllerRenderProps<any, any>;
  error: FieldError | undefined;
  placeholder: string;
  colors: any;
  typography: any;
  spacing: any;
  inputStyle?: any;
  errorTextStyle?: any;
  restProps: any;
  fieldName: string;
}>(({ field, error, placeholder, colors, typography, spacing, inputStyle, errorTextStyle, restProps, fieldName }, ref) => {
  
  // Assign unique ID to track component instances
  const instanceId = useRef(++componentInstanceCounter);
  const inputRef = useRef<RNInput>(null);


  // Track props changes that might cause re-renders
  const propsHash = useMemo(() => {
    return JSON.stringify({
      placeholder,
      hasError: !!error,
      fieldValue: field.value,
      colorsKeys: Object.keys(colors || {}),
      typographyKeys: Object.keys(typography || {}),
      restPropsKeys: Object.keys(restProps || {}),
    });
  }, [placeholder, error, field.value, colors, typography, restProps]);

  const prevPropsHash = useRef(propsHash);
  useEffect(() => {
    if (prevPropsHash.current !== propsHash) {
      prevPropsHash.current = propsHash;
    }
  }, [propsHash, fieldName]);

  // Track field object identity
  const fieldRef = useRef(field);
  useEffect(() => {
    if (fieldRef.current !== field) {
      fieldRef.current = field;
    }
  }, [field, fieldName]);

  // Memoize styles
  const inputStyles = useMemo(() => ({
    borderWidth: 1,
    borderColor: error ? colors.danger : colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.card,
    textAlignVertical: restProps?.multiline ? "top" : "center",
  }), [error, colors.danger, colors.border, colors.text, colors.card, typography.body.fontSize, restProps?.multiline]);

  const errorStyles = useMemo(() => ({
    color: colors.danger,
    marginTop: 4,
    fontSize: typography.caption.fontSize,
  }), [colors.danger, typography.caption.fontSize]);

  // Enhanced event handlers with instance tracking
  const handleChangeText = useCallback((text: string) => {
    field.onChange(text);
  }, [field.onChange, fieldName]);

  const handleFocus = useCallback((e: any) => {
    restProps?.onFocus?.(e);
  }, [restProps?.onFocus, fieldName]);

  const handleBlur = useCallback((e: any) => {
    field.onBlur();
    restProps?.onBlur?.(e);
  }, [field.onBlur, restProps?.onBlur, fieldName]);

  // Combine refs properly
  const combinedRef = useCallback((node: RNInput) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <>
      <RNInput
        ref={combinedRef}
        style={[inputStyles, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={field.value || ""}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...restProps}
      />
      {error && (
        <Text style={[errorStyles, errorTextStyle]}>
          {error.message}
        </Text>
      )}
    </>
  );
}));

StableNativeInput.displayName = "StableNativeInput";

export const TextInput: FC<TextInputProps> = memo(
  ({
    control,
    name,
    label,
    helperText,
    placeholder = "",
    rules = {},
    containerStyle,
    inputStyle,
    labelStyle,
    helperTextStyle,
    errorTextStyle,
    required,
    ...rest
  }) => {
    const { colors, typography, spacing } = useTheme();
    const inputRef = useRef<RNInput>(null);
    
    // Assign unique ID to track TextInput instances
    const instanceId = useRef(++componentInstanceCounter);


    // Memoize rest props more carefully
    const restProps = useMemo(() => {
      return rest;
    }, [
      rest.multiline,
      rest.numberOfLines,
      rest.maxLength,
      rest.keyboardType,
      rest.autoCapitalize,
      rest.autoCorrect,
      rest.secureTextEntry,
      rest.editable,
      rest.onFocus,
      rest.onBlur,
      // Add any other props you use
    ]);

    // Enhanced render function tracking
    const renderInput = useCallback(
      ({ field, fieldState: { error } }: any) => {
        
        return (
          <StableNativeInput
            ref={inputRef}
            field={field}
            error={error}
            placeholder={placeholder}
            colors={colors}
            typography={typography}
            spacing={spacing}
            inputStyle={inputStyle}
            errorTextStyle={errorTextStyle}
            restProps={restProps}
            fieldName={name}
          />
        );
      },
      [placeholder, colors, typography, spacing, inputStyle, errorTextStyle, restProps, name]
    );

    // Track render function stability
    const renderFunctionRef = useRef(renderInput);
    useEffect(() => {
      renderFunctionRef.current = renderInput;
    }, [renderInput, name]);

    // Memoize all styles
    const labelStyles = useMemo(() => ({
      marginBottom: spacing?.xs || 4,
      fontSize: typography?.body?.fontSize || 16,
      fontWeight: typography?.body?.fontWeight || 'normal',
      color: colors?.text || '#000',
    }), [spacing?.xs, typography?.body?.fontSize, typography?.body?.fontWeight, colors?.text]);

    const requiredStyles = useMemo(() => ({
      color: colors?.danger || 'red',
      marginLeft: 4,
    }), [colors?.danger]);

    const helperStyles = useMemo(() => ({
      fontSize: typography?.caption?.fontSize || 12,
      color: colors?.muted || '#666',
      marginTop: 4,
    }), [typography?.caption?.fontSize, colors?.muted]);

    const labelContainerStyle = useMemo(() => ({
      flexDirection: "row" as const,
      alignItems: "center" as const,
    }), []);

    return (
      <View style={containerStyle}>
        {label && (
          <View style={labelContainerStyle}>
            <Text style={[labelStyles, labelStyle]}>{label}</Text>
            {required && <Text style={requiredStyles}>*</Text>}
          </View>
        )}
        
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={renderInput}
        />
        
        {helperText && (
          <Text style={[helperStyles, helperTextStyle]}>{helperText}</Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = "TextInput";