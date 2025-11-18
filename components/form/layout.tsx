// components/form/FormLayout.tsx - Maximum stability form wrapper
import Card from "@/components/card";
import { useTheme } from "@/hooks/use-theme";
import React, { memo, useCallback, useMemo, useRef } from "react";
import { FieldValues, FormProvider, useForm, UseFormProps } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  ViewStyle,
} from "react-native";

interface FormLayoutProps<T extends FieldValues> {
  children: React.ReactNode;
  formConfig: UseFormProps<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  containerStyle?: ViewStyle;
  enableKeyboardAvoidance?: boolean;
  enableScrolling?: boolean;
  enableCard?: boolean;
  cardProps?: any;
  scrollViewProps?: any;
  keyboardAvoidingViewProps?: any;
  debug?: boolean;
}

// Ultra-stable content wrapper that prevents children re-renders
const UltraStableContentWrapper = memo(({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
}, () => true); // Never re-render - children changes are handled by React itself

UltraStableContentWrapper.displayName = "UltraStableContentWrapper";

function StableFormLayout<T extends FieldValues>({
  children,
  formConfig,
  onSubmit,
  containerStyle,
  enableKeyboardAvoidance = true,
  enableScrolling = true,
  enableCard = true,
  cardProps,
  scrollViewProps,
  keyboardAvoidingViewProps,
  debug = false,
}: FormLayoutProps<T>) {
  const { colors, spacing } = useTheme();
  
  // Debug logging
  const debugLog = useCallback((message: string, data?: any) => {
    if (debug) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.log(`[${timestamp}] ULTIMATE_FORM: ${message}`, data || '');
    }
  }, [debug]);

  // CRITICAL: Create ultra-stable form instance
  const stableFormConfig = useMemo(() => {
    debugLog("Form config memoized");
    return {
      ...formConfig,
      // Ensure defaultValues are stable
      defaultValues: formConfig.defaultValues || {},
    };
  }, [
    formConfig.resolver,
    formConfig.mode,
    // Use deep comparison for default values only if they exist
    formConfig.defaultValues ? JSON.stringify(formConfig.defaultValues) : undefined,
    debugLog,
  ]);

  const form = useForm<T>(stableFormConfig as UseFormProps<T>);
  
  // Track form stability
  const formRef = useRef(form);
  if (formRef.current !== form) {
    debugLog("⚠️ FORM INSTANCE CHANGED");
    formRef.current = form;
  }

  // Ultra-stable submit handler
  const handleSubmit = useCallback(
    async (data: T) => {
      debugLog("Form submitted", { dataKeys: Object.keys(data) });
      if (onSubmit) {
        try {
          await onSubmit(data);
        } catch (error) {
          debugLog("Submit error", { error: (error as Error).message });
          throw error;
        }
      }
    },
    [onSubmit, debugLog]
  );

  // Ultra-stable styles
  const containerStyles = useMemo(() => ({
    flex: 1,
    backgroundColor: colors.background,
    ...containerStyle,
  }), [colors.background, containerStyle]);

  const scrollContentStyles = useMemo(() => ({
    flexGrow: 1,
    padding: spacing.md,
  }), [spacing.md]);

  const cardBodyStyles = useMemo(() => ({
    gap: spacing.md,
  }), [spacing.md]);

  // Ultra-stable component props
  const stableKeyboardProps = useMemo(() => ({
    style: { flex: 1 },
    behavior: Platform.OS === "ios" ? "padding" : "height" as const,
    ...keyboardAvoidingViewProps,
  }), [keyboardAvoidingViewProps]);

  const stableScrollProps = useMemo(() => ({
    contentContainerStyle: scrollContentStyles,
    keyboardShouldPersistTaps: "handled" as const,
    showsVerticalScrollIndicator: false,
    ...scrollViewProps,
  }), [scrollContentStyles, scrollViewProps]);

  const stableCardProps = useMemo(() => ({
    styles: { body: cardBodyStyles },
    ...cardProps,
  }), [cardBodyStyles, cardProps]);

  // Ultra-stable form context
  const formContextValue = useMemo(() => ({
    ...form,
    handleSubmit: form.handleSubmit,
    formState: form.formState,
  }), [form]);

  // Build component tree with maximum stability
  let content = <UltraStableContentWrapper>{children}</UltraStableContentWrapper>;

  // Wrap in Card if enabled
  if (enableCard) {
    content = <Card {...stableCardProps}>{content}</Card>;
  }

  // Wrap in ScrollView if enabled
  if (enableScrolling) {
    content = <ScrollView {...stableScrollProps}>{content}</ScrollView>;
  }

  // Wrap in KeyboardAvoidingView if enabled
  if (enableKeyboardAvoidance) {
    content = (
      <KeyboardAvoidingView {...stableKeyboardProps}>
        {content}
      </KeyboardAvoidingView>
    );
  }

  debugLog("Rendering form", {
    enableKeyboardAvoidance,
    enableScrolling,
    enableCard,
    hasOnSubmit: !!onSubmit,
  });

  return (
    <FormProvider {...formContextValue}>
      <View style={containerStyles}>
        {content}
      </View>
    </FormProvider>
  );
}

// Ultra-stable memoized wrapper
export const FormLayout = memo(StableFormLayout, (prevProps, nextProps) => {
  // Custom comparison for maximum stability
  const configChanged = (
    prevProps.formConfig.resolver !== nextProps.formConfig.resolver ||
    prevProps.formConfig.mode !== nextProps.formConfig.mode ||
    JSON.stringify(prevProps.formConfig.defaultValues) !== JSON.stringify(nextProps.formConfig.defaultValues)
  );
  
  const propsChanged = (
    prevProps.onSubmit !== nextProps.onSubmit ||
    prevProps.enableKeyboardAvoidance !== nextProps.enableKeyboardAvoidance ||
    prevProps.enableScrolling !== nextProps.enableScrolling ||
    prevProps.enableCard !== nextProps.enableCard ||
    prevProps.debug !== nextProps.debug
  );

  // Only re-render if essential props change
  return !configChanged && !propsChanged;
}) as typeof StableFormLayout;

// Hook to access form methods safely
export function useUltimateForm<T extends FieldValues = FieldValues>() {
  const context = React.useContext(FormProvider as any);
  if (!context) {
    throw new Error("useUltimateForm must be used within FormLayout");
  }
  return context as ReturnType<typeof useForm<T>>;
}

// Convenience HOC for form screens
export function withUltimateForm<T extends FieldValues>(
  Component: React.ComponentType<any>,
  formConfig: UseFormProps<T>
) {
  return memo((props: any) => (
    <FormLayout formConfig={formConfig}>
      <Component {...props} />
    </FormLayout>
  ));
}