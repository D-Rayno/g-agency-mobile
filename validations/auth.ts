// validations/auth.ts
import { useCallback, useState } from "react";
import * as yup from "yup";
import zxcvbn from "zxcvbn";

export const loginSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .test(
      "is-username-or-email",
      "Invalid username or email format",
      (value) => {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return usernameRegex.test(value) || emailRegex.test(value);
      }
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(1, "Password is required"),
});

export const adminLoginSchema = yup.object({
  password: yup
    .string()
    .required("Password is required"),
});

export const setPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain a special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

export const forgotPasswordSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
});

export const otpSchema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be 6 digits")
    .length(6, "OTP must be 6 digits"),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain a special character"
    )
    .notOneOf(
      [yup.ref("currentPassword")],
      "New password must be different from current password"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

export const personalInfoSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  dateOfBirth: yup.string().optional(),
  gender: yup
    .string()
    .oneOf(["male", "female", "other", "prefer_not_to_say"])
    .optional(),
});

export const personalInfoUpdateSchema = yup.object({
  firstName: yup
    .string()
    .optional()
    .when("$isProvided", {
      is: true,
      then: (schema) =>
        schema
          .required("First name is required")
          .min(2, "First name must be at least 2 characters"),
      otherwise: (schema) => schema.optional(),
    }),
  lastName: yup
    .string()
    .optional()
    .when("$isProvided", {
      is: true,
      then: (schema) =>
        schema
          .required("Last name is required")
          .min(2, "Last name must be at least 2 characters"),
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
    .email("Invalid email format")
    .required("Email is required"),
});

export const changePhoneSchema = yup.object({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});

export const phoneValidationSchema = yup.object({
  phone: yup
    .string()
    .required("Phone number is required")
    .test("phone-format", "Invalid phone format", (value) => {
      if (!value) return false;
      const cleanPhone = value.replace(/\s/g, "");
      const phoneRegex = /^\+\d{1,4}\s?\d{6,12}$/;
      return phoneRegex.test(cleanPhone);
    })
    .test(
      "local-number-length",
      "Invalid local number length",
      (value) => {
        if (!value) return false;
        const parts = value.split(" ");
        if (parts.length < 2) return false;
        const localNumber = parts.slice(1).join("").replace(/\s/g, "");
        return localNumber.length >= 6 && localNumber.length <= 12;
      }
    ),
});

export const phoneFieldValidation = yup
  .string()
  .required("Phone number is required")
  .test("phone-format", "Invalid phone format", (value) => {
    if (!value) return false;
    const cleanPhone = value.replace(/\s/g, "");
    const phoneRegex = /^\+\d{1,4}\s?\d{6,12}$/;
    return phoneRegex.test(cleanPhone);
  })
  .test(
    "local-number-length",
    "Invalid local number length",
    (value) => {
      if (!value) return false;
      const parts = value.split(" ");
      if (parts.length < 2) return false;
      const localNumber = parts.slice(1).join("").replace(/\s/g, "");
      return localNumber.length >= 6 && localNumber.length <= 12;
    }
  );

export const setupEmailSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    ),
});

export const verifyEmailOTPSchema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be 6 digits")
    .length(6, "OTP must be 6 digits"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type AdminLoginFormData = yup.InferType<typeof adminLoginSchema>;
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

export const getPasswordStrength = (password: string) => {
  const result = zxcvbn(password);
  const strengthLevels = ["weak", "weak", "fair", "good", "strong"];
  return {
    score: result.score,
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

export const validateUsernameFormat = (username: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(username);
};

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

export const usePasswordVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return { isVisible, toggle };
};

export const formatOTP = (value: string): string => {
  return value.replace(/\D/g, "").slice(0, 6);
};