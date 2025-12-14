// hooks/use-validation-schemas.ts
import * as validationSchemas from "@/validations/auth";

export const useValidationSchemas = () => {
  const schemas = {
    loginSchema: validationSchemas.loginSchema,
    adminLoginSchema: validationSchemas.adminLoginSchema,
    setPasswordSchema: validationSchemas.setPasswordSchema,
    forgotPasswordSchema: validationSchemas.forgotPasswordSchema,
    otpSchema: validationSchemas.otpSchema,
    changePasswordSchema: validationSchemas.changePasswordSchema,
    personalInfoSchema: validationSchemas.personalInfoSchema,
    personalInfoUpdateSchema: validationSchemas.personalInfoUpdateSchema,
    changeEmailSchema: validationSchemas.changeEmailSchema,
    changePhoneSchema: validationSchemas.changePhoneSchema,
    phoneValidationSchema: validationSchemas.phoneValidationSchema,
    phoneFieldValidation: validationSchemas.phoneFieldValidation,
    setupEmailSchema: validationSchemas.setupEmailSchema,
    verifyEmailOTPSchema: validationSchemas.verifyEmailOTPSchema,
  };

  return {
    schemas,
    isLoading: false,
  };
};
