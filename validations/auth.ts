// validations/auth.ts - Updated with i18n support
import AppI18nManager from "@/i18n/config";
import { useCallback, useState } from "react";
import * as yup from "yup";
import zxcvbn from "zxcvbn";

// Get translation function
const t = AppI18nManager.translate;

export const loginSchema = yup.object({
  username: yup
    .string()
    .required(() => t("validation.username.required"))
    .min(3, () => t("validation.username.minLength", { count: 3 }))
    .test(
      "is-username-or-email",
      () => t("validation.username.format"),
      (value) => {
        // Username regex: letters, numbers, hyphens, underscores, 3+ characters
        const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
        // Email regex: basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return usernameRegex.test(value) || emailRegex.test(value);
      }
    ),
  password: yup
    .string()
    .required(() => t("validation.password.required"))
    .min(1, () => t("validation.password.required")),
});

export const setPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required(() => t("validation.password.required"))
    .min(8, () => t("validation.password.minLength", { count: 8 }))
    .matches(/[A-Z]/, () => t("validation.password.uppercase"))
    .matches(/[a-z]/, () => t("validation.password.lowercase"))
    .matches(/[0-9]/, () => t("validation.password.number"))
    .matches(
      /[@$!%*?&]/,
      () => t("validation.password.special")
    ),
  confirmPassword: yup
    .string()
    .required(() => t("validation.password.confirmRequired"))
    .oneOf([yup.ref("newPassword")], () => t("validation.password.match")),
});

export const forgotPasswordSchema = yup.object({
  username: yup
    .string()
    .required(() => t("validation.username.required"))
    .min(3, () => t("validation.username.minLength", { count: 3 })),
});

export const otpSchema = yup.object({
  otp: yup
    .string()
    .required(() => t("validation.otp.required"))
    .matches(/^\d{6}$/, () => t("validation.otp.length"))
    .length(6, () => t("validation.otp.length")),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required(() => t("validation.password.currentRequired")),
  newPassword: yup
    .string()
    .required(() => t("validation.password.required"))
    .min(8, () => t("validation.password.minLength", { count: 8 }))
    .matches(/[A-Z]/, () => t("validation.password.uppercase"))
    .matches(/[a-z]/, () => t("validation.password.lowercase"))
    .matches(/[0-9]/, () => t("validation.password.number"))
    .matches(
      /[@$!%*?&]/,
      () => t("validation.password.special")
    )
    .notOneOf(
      [yup.ref("currentPassword")],
      () => t("validation.password.different")
    ),
  confirmPassword: yup
    .string()
    .required(() => t("validation.password.confirmRequired"))
    .oneOf([yup.ref("newPassword")], () => t("validation.password.match")),
});

export const personalInfoSchema = yup.object({
  firstName: yup
    .string()
    .required(() => t("validation.name.required", { field: t("profile.firstName") }))
    .min(2, () => t("validation.name.minLength", { field: t("profile.firstName"), count: 2 })),
  lastName: yup
    .string()
    .required(() => t("validation.name.required", { field: t("profile.lastName") }))
    .min(2, () => t("validation.name.minLength", { field: t("profile.lastName"), count: 2 })),
  dateOfBirth: yup.string().optional(),
  gender: yup
    .string()
    .oneOf(["male", "female", "other", "prefer_not_to_say"])
    .optional(),
});

// Schema for partial updates - only validates provided fields
export const personalInfoUpdateSchema = yup.object({
  firstName: yup
    .string()
    .optional()
    .when("$isProvided", {
      is: true,
      then: (schema) =>
        schema
          .required(() => t("validation.name.required", { field: t("profile.firstName") }))
          .min(2, () => t("validation.name.minLength", { field: t("profile.firstName"), count: 2 })),
      otherwise: (schema) => schema.optional(),
    }),
  lastName: yup
    .string()
    .optional()
    .when("$isProvided", {
      is: true,
      then: (schema) =>
        schema
          .required(() => t("validation.name.required", { field: t("profile.lastName") }))
          .min(2, () => t("validation.name.minLength", { field: t("profile.lastName"), count: 2 })),
      otherwise: (schema) => schema.optional(),
    }),
  phone: yup.string().optional(),
  dateOfBirth: yup.string().optional(),
  gender: yup
    .string()
    .oneOf(["male", "female", "other", "prefer_not_to_say"])
    .optional(),
});

export const changeEmailSchema = yup.object({
  email: yup
    .string()
    .email(() => t("validation.email.invalid"))
    .required(() => t("validation.email.required")),
});

export const changePhoneSchema = yup.object({
  phone: yup
    .string()
    .required(() => t("validation.phone.required"))
    .matches(/^\+?[1-9]\d{1,14}$/, () => t("validation.phone.invalid")),
});

// New comprehensive phone validation schema
export const phoneValidationSchema = yup.object({
  phone: yup
    .string()
    .required(() => t("validation.phone.required"))
    .test("phone-format", () => t("validation.phone.invalid"), (value) => {
      if (!value) return false;

      // Remove spaces and check if it starts with country code
      const cleanPhone = value.replace(/\s/g, "");

      // Should start with + followed by country code and local number
      const phoneRegex = /^\+\d{1,4}\s?\d{6,12}$/;
      return phoneRegex.test(cleanPhone);
    })
    .test(
      "local-number-length",
      () => t("validation.phone.localLength"),
      (value) => {
        if (!value) return false;

        // Extract local number (after country code)
        const parts = value.split(" ");
        if (parts.length < 2) return false;

        const localNumber = parts.slice(1).join("").replace(/\s/g, "");
        return localNumber.length >= 6 && localNumber.length <= 12;
      }
    ),
});

// Standalone phone field validation (for use in forms)
export const phoneFieldValidation = yup
  .string()
  .required(() => t("validation.phone.required"))
  .test("phone-format", () => t("validation.phone.invalid"), (value) => {
    if (!value) return false;

    // Remove spaces and check if it starts with country code
    const cleanPhone = value.replace(/\s/g, "");

    // Should start with + followed by country code and local number
    const phoneRegex = /^\+\d{1,4}\s?\d{6,12}$/;
    return phoneRegex.test(cleanPhone);
  })
  .test(
    "local-number-length",
    () => t("validation.phone.localLength"),
    (value) => {
      if (!value) return false;

      // Extract local number (after country code)
      const parts = value.split(" ");
      if (parts.length < 2) return false;

      const localNumber = parts.slice(1).join("").replace(/\s/g, "");
      return localNumber.length >= 6 && localNumber.length <= 12;
    }
  );

export const setupEmailSchema = yup.object({
  email: yup
    .string()
    .email(() => t("validation.email.invalid"))
    .required(() => t("validation.email.required"))
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      () => t("validation.email.format")
    ),
});

// Email OTP verification schema
export const verifyEmailOTPSchema = yup.object({
  otp: yup
    .string()
    .required(() => t("validation.otp.required"))
    .matches(/^\d{6}$/, () => t("validation.otp.digits"))
    .length(6, () => t("validation.otp.length")),
});

// Keep all existing type exports unchanged
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type SetPasswordFormData = yup.InferType<typeof setPasswordSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
export type OTPFormData = yup.InferType<typeof otpSchema>;
export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;
export type PersonalInfoFormData = yup.InferType<typeof personalInfoSchema>;
export type PersonalInfoUpdateData = yup.InferType<typeof personalInfoUpdateSchema>;
export type ChangeEmailFormData = yup.InferType<typeof changeEmailSchema>;
export type ChangePhoneFormData = yup.InferType<typeof changePhoneSchema>;
export type PhoneValidationData = yup.InferType<typeof phoneValidationSchema>;
export type SetupEmailFormData = yup.InferType<typeof setupEmailSchema>;
export type VerifyEmailOTPFormData = yup.InferType<typeof verifyEmailOTPSchema>;

// Password strength utility
export const getPasswordStrength = (password: string) => {
  const result = zxcvbn(password);
  const strengthLevels = ["weak", "weak", "fair", "good", "strong"];
  return {
    score: result.score, // 0-4
    strength: strengthLevels[result.score] as
      | "weak"
      | "fair"
      | "good"
      | "strong",
    feedback: result.feedback.suggestions.concat(
      result.feedback.warning ? [result.feedback.warning] : []
    ),
  };
};

// Username validation utility
export const validateUsernameFormat = (username: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(username);
};

// Phone formatting and validation utilities
export const formatPhoneNumber = (
  value: string,
  countryCode: string
): string => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  let formatted = digits;
  if (digits.length > 3) formatted = digits.slice(0, 3) + " " + digits.slice(3);
  if (digits.length > 6)
    formatted = formatted.slice(0, 7) + " " + formatted.slice(7);
  return `${countryCode} ${formatted}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s/g, "");
  const phoneRegex = /^\+\d{1,4}\d{6,12}$/;
  return phoneRegex.test(cleanPhone);
};

// Password visibility toggle utility
export const usePasswordVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return { isVisible, toggle };
};

// OTP formatting utility
export const formatOTP = (value: string): string => {
  return value.replace(/\D/g, "").slice(0, 6);
};