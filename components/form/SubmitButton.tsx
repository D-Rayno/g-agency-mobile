// components/form/SubmitButton.tsx
/**
 * Enhanced Submit Button Component
 * Modern design with form state integration and refined styling
 */

import { Button, ButtonProps } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Animated } from 'react-native';

interface SubmitButtonProps extends Omit<ButtonProps, 'onPress'> {
  onSubmit?: (data: any) => void;
  successMessage?: string;
  showSuccessIcon?: boolean;
  resetSuccessAfter?: number;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  children = 'Submit', 
  isLoading,
  variant = 'primary',
  gradient = true,
  fullWidth = true,
  size = 'lg',
  onSubmit,
  successMessage = 'Success!',
  showSuccessIcon = true,
  resetSuccessAfter = 2000,
  ...props 
}) => {
  const { handleSubmit, formState: { isSubmitting, isValid, errors } } = useFormContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const hasErrors = Object.keys(errors).length > 0;
  const isActuallyLoading = isLoading || isSubmitting;

  useEffect(() => {
    if (showSuccess) {
      // Success animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
          speed: 50,
          bounciness: 10,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();

      // Reset success state
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, resetSuccessAfter);

      return () => clearTimeout(timer);
    }
  }, [showSuccess, resetSuccessAfter]);

  const handlePress = async (data: any) => {
    if (onSubmit) {
      try {
        await onSubmit(data);
        setShowSuccess(true);
      } catch (error) {
        // Error is handled by form/parent component
        console.error('Submit error:', error);
      }
    }
  };

  // Determine button state and styling
  const getButtonVariant = () => {
    if (showSuccess) return 'success';
    if (hasErrors) return 'outline';
    return variant;
  };

  const getButtonContent = () => {
    if (showSuccess) {
      return (
        <>
          {showSuccessIcon && (
            <Ionicons 
              name="checkmark-circle" 
              size={size === 'sm' ? 18 : size === 'md' ? 20 : 24} 
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
          )}
          {successMessage}
        </>
      );
    }
    return children;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Button
        onPress={handleSubmit(handlePress)}
        isLoading={isActuallyLoading}
        isDisabled={isActuallyLoading || showSuccess}
        variant={getButtonVariant()}
        gradient={gradient}
        fullWidth={fullWidth}
        size={size}
        animated={!showSuccess}
        {...props}
      >
        {getButtonContent()}
      </Button>
    </Animated.View>
  );
};

export default SubmitButton;