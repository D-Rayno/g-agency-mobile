import { Button, ButtonProps } from '@/components/ui/Button';
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface SubmitButtonProps extends Omit<ButtonProps, 'onPress'> {
  onSubmit?: (data: any) => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  children, 
  isLoading, 
  onSubmit,
  ...props 
}) => {
  const { handleSubmit, formState: { isSubmitting } } = useFormContext();

  const handlePress = (data: any) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <Button
      onPress={handleSubmit(handlePress)}
      isLoading={isLoading || isSubmitting}
      {...props}
    >
      {children}
    </Button>
  );
};
