// hooks/use-validation-schemas.ts - Fixed version
import { useI18n } from "@/context/i18n";
import * as validationSchemas from "@/validations/auth";
import { useMemo } from "react";

const createLoginSchema = () => validationSchemas.loginSchema;
const createSetPasswordSchema = () => validationSchemas.setPasswordSchema;
const createForgotPasswordSchema = () => validationSchemas.forgotPasswordSchema;
const createOtpSchema = () => validationSchemas.otpSchema;
const createChangePasswordSchema = () => validationSchemas.changePasswordSchema;
const createPersonalInfoSchema = () => validationSchemas.personalInfoSchema;
const createPersonalInfoUpdateSchema = () =>
  validationSchemas.personalInfoUpdateSchema;
const createChangeEmailSchema = () => validationSchemas.changeEmailSchema;
const createChangePhoneSchema = () => validationSchemas.changePhoneSchema;
const createPhoneValidationSchema = () =>
  validationSchemas.phoneValidationSchema;
const createPhoneFieldValidation = () => validationSchemas.phoneFieldValidation;
const createSetupEmailSchema = () => validationSchemas.setupEmailSchema;
const createVerifyEmailOTPSchema = () => validationSchemas.verifyEmailOTPSchema;

export const useValidationSchemas = () => {
  const { language, isLoading } = useI18n();

  // Re-create schemas when language changes to get updated translations
  // But only after i18n is fully loaded
  const schemas = useMemo(() => {
    if (isLoading)
      return {
        loginSchema: null,
        setPasswordSchema: null,
        forgotPasswordSchema: null,
        otpSchema: null,
        changePasswordSchema: null,
        personalInfoSchema: null,
        personalInfoUpdateSchema: null,
        changeEmailSchema: null,
        changePhoneSchema: null,
        phoneValidationSchema: null,
        phoneFieldValidation: null,
        setupEmailSchema: null,
        verifyEmailOTPSchema: null,
      };

    return {
      loginSchema: createLoginSchema(),
      setPasswordSchema: createSetPasswordSchema(),
      forgotPasswordSchema: createForgotPasswordSchema(),
      otpSchema: createOtpSchema(),
      changePasswordSchema: createChangePasswordSchema(),
      personalInfoSchema: createPersonalInfoSchema(),
      personalInfoUpdateSchema: createPersonalInfoUpdateSchema(),
      changeEmailSchema: createChangeEmailSchema(),
      changePhoneSchema: createChangePhoneSchema(),
      phoneValidationSchema: createPhoneValidationSchema(),
      phoneFieldValidation: createPhoneFieldValidation(),
      setupEmailSchema: createSetupEmailSchema(),
      verifyEmailOTPSchema: createVerifyEmailOTPSchema(),
    };
  }, [language, isLoading]);

  return {
    schemas,
    isLoading,
  };
};
