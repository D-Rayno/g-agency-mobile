// components/ui/Typography.tsx
import { cn } from '@/utils/cn';
import React from 'react';
import { Text, TextProps } from 'react-native';

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray' | 'white' | 'black';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const Typography = React.forwardRef<Text, TypographyProps>(
  (
    {
      children,
      variant = 'body',
      weight = 'normal',
      color,
      align = 'left',
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      h1: 'text-4xl leading-tight',
      h2: 'text-3xl leading-tight',
      h3: 'text-2xl leading-snug',
      h4: 'text-xl leading-snug',
      h5: 'text-lg leading-normal',
      h6: 'text-base leading-normal',
      body: 'text-base leading-relaxed',
      caption: 'text-sm leading-normal',
      overline: 'text-xs uppercase tracking-wide',
    };

    const weightStyles = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    };

    const colorStyles = color
      ? {
          primary: 'text-primary-600',
          secondary: 'text-secondary-600',
          success: 'text-success-600',
          warning: 'text-warning-600',
          error: 'text-error-600',
          gray: 'text-gray-600',
          white: 'text-white',
          black: 'text-black',
        }[color]
      : 'text-gray-900';

    const alignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <Text
        ref={ref}
        className={cn(
          variantStyles[variant],
          weightStyles[weight],
          colorStyles,
          alignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

Typography.displayName = 'Typography';

// Convenience components
export const Heading1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" weight="bold" {...props} />
);

export const Heading2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" weight="bold" {...props} />
);

export const Heading3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" weight="semibold" {...props} />
);

export const BodyText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" color="gray" {...props} />
);
