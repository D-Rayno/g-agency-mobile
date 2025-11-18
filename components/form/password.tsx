// components/form/password.tsx - Fixed with translations
import { yupResolver } from "@hookform/resolvers/yup";
import React, { memo, useCallback, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "@/components/button";
import Card from "@/components/card";
import { PasswordInput } from "@/components/input/password";
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator";
import { useI18n } from "@/context/i18n";
import { useTheme } from "@/hooks/use-theme";
import { useValidationSchemas } from "@/hooks/use-validation-schemas";
import { type SetPasswordFormData } from "@/validations/auth";
import Info from "../Info";

interface PasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  isLoading?: boolean;
  title: string;
  buttonTitle: string;
  error?: string | null;
  onErrorDismiss?: () => void;
}

// Form content component that watches password changes
const PasswordFormContent = memo(({ control }: { control: any }) => {
  const { spacing } = useTheme();
  const { t } = useI18n();

  // Watch the newPassword field for strength indicator
  const newPassword = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  const containerStyle = useMemo(
    () => ({
      gap: spacing.md,
    }),
    [spacing.md]
  );

  return (
    <View style={containerStyle}>
      <PasswordInput
        control={control}
        name="newPassword"
        label={t("auth.newPassword")}
        placeholder={t("auth.newPasswordPlaceholder")}
        required
        autoComplete="new-password"
      />

      {/* Use your existing password strength indicator */}
      <PasswordStrengthIndicator password={newPassword} />

      <PasswordInput
        control={control}
        name="confirmPassword"
        label={t("auth.confirmNewPassword")}
        placeholder={t("auth.confirmNewPasswordPlaceholder")}
        required
        autoComplete="new-password"
      />
    </View>
  );
});

PasswordFormContent.displayName = "PasswordFormContent";

// Form header with error display
const FormHeader = memo(
  ({
    title,
    error,
    onErrorDismiss,
  }: {
    title: string;
    error?: string | null;
    onErrorDismiss?: () => void;
  }) => {
    const { colors, typography, spacing } = useTheme();

    const titleStyle = useMemo(
      () => ({
        fontSize: typography.heading.fontSize,
        fontWeight: typography.heading.fontWeight as any,
        color: colors.text,
        marginBottom: spacing.lg,
        textAlign: "center" as const,
      }),
      [colors.text, typography.heading, spacing.lg]
    );

    return (
      <>
        <Text style={titleStyle}>{title}</Text>

        {error && (
          <Info
            type="error"
            message={error}
            dismissible={!!onErrorDismiss}
            onDismiss={onErrorDismiss}
          />
        )}
      </>
    );
  }
);

FormHeader.displayName = "FormHeader";

// Main password form component
export const PasswordForm = memo(
  ({
    onSubmit,
    isLoading = false,
    title,
    buttonTitle,
    error,
    onErrorDismiss,
  }: PasswordFormProps) => {
    const { colors, spacing } = useTheme();
    const { t } = useI18n();
    const {
      schemas: { setPasswordSchema },
      isLoading: schemasLoading,
    } = useValidationSchemas();

    // Create form config only when schemas are ready
    const formConfig = useMemo(() => {
      return {
        resolver:
          schemasLoading || !setPasswordSchema
            ? undefined
            : yupResolver(setPasswordSchema),
        mode: "onChange" as const,
        defaultValues: {
          newPassword: "",
          confirmPassword: "",
        },
      };
    }, [setPasswordSchema, schemasLoading]);

    // Create form with validation
    const form = useForm<SetPasswordFormData>(formConfig);

    const {
      handleSubmit,
      formState: { isValid, errors, isDirty },
    } = form;

    // Handle form submission
    const onFormSubmit = useCallback(
      async (data: SetPasswordFormData) => {
        try {
          await onSubmit(data.newPassword);
        } catch (error) {
          console.error("Password form submission error:", error);
          // Error handling is done by parent component
        }
      },
      [onSubmit]
    );

    // Check if form is ready for submission
    const isFormReady = useMemo(() => {
      return isValid && isDirty && !isLoading;
    }, [isValid, isDirty, isLoading]);

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: "center",
      },
      formContainer: {
        gap: spacing.lg,
      },
      submitButton: {
        marginTop: spacing.md,
      },
      debugContainer: {
        marginTop: spacing.sm,
        padding: spacing.sm,
        backgroundColor: colors.muted + "20",
        borderRadius: 4,
      },
      debugText: {
        fontSize: 12,
        color: colors.muted,
      },
      debugErrorText: {
        fontSize: 12,
        color: colors.danger,
      },
    });

    return (
      <FormProvider {...form}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Card>
                <View style={styles.formContainer}>
                  <FormHeader
                    title={title}
                    error={error}
                    onErrorDismiss={onErrorDismiss}
                  />

                  <PasswordFormContent control={form.control} />

                  <View style={styles.submitButton}>
                    <Button
                      title={isLoading ? t("common.processing") : buttonTitle}
                      onPress={handleSubmit(onFormSubmit)}
                      disabled={!isFormReady}
                      variant="primary"
                      icon={{
                        family: "Feather",
                        name: isLoading ? "clock" : "check",
                        size: 18,
                      }}
                    />
                  </View>
                </View>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </FormProvider>
    );
  }
);

PasswordForm.displayName = "PasswordForm";
