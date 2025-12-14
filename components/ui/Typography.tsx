// components/ui/Typography.tsx
/**
 * Enhanced Typography Components
 * Modern text styles with proper hierarchy and responsiveness
 */

import { cn } from '@/utils/cn';
import React from 'react';
import { Text, TextProps } from 'react-native';

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray' | 'white' | 'black';
  align?: 'left' | 'center' | 'right';
  className?: string;
  gradient?: boolean;
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
      gradient = false,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      h1: 'text-5xl leading-tight',
      h2: 'text-4xl leading-tight',
      h3: 'text-3xl leading-snug',
      h4: 'text-2xl leading-snug',
      h5: 'text-xl leading-normal',
      h6: 'text-lg leading-normal',
      body: 'text-base leading-relaxed',
      caption: 'text-sm leading-normal',
      overline: 'text-xs uppercase tracking-widest',
    };

    const weightStyles = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
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

// Enhanced Heading Components
export const Heading1 = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="h1" weight="extrabold" {...props} />
  )
);
Heading1.displayName = 'Heading1';

export const Heading2 = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="h2" weight="bold" {...props} />
  )
);
Heading2.displayName = 'Heading2';

export const Heading3 = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="h3" weight="bold" {...props} />
  )
);
Heading3.displayName = 'Heading3';

export const Heading4 = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="h4" weight="semibold" {...props} />
  )
);
Heading4.displayName = 'Heading4';

export const Heading5 = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="h5" weight="semibold" {...props} />
  )
);
Heading5.displayName = 'Heading5';

export const Heading6 = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="h6" weight="semibold" {...props} />
  )
);
Heading6.displayName = 'Heading6';

export const BodyText = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="body" {...props} />
  )
);
BodyText.displayName = 'BodyText';

export const Caption = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="caption" color="gray" {...props} />
  )
);
Caption.displayName = 'Caption';

export const Overline = React.forwardRef<Text, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography ref={ref} variant="overline" weight="bold" color="gray" {...props} />
  )
);
Overline.displayName = 'Overline';

// Label Component for forms
export interface LabelProps extends TextProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const Label = React.forwardRef<Text, LabelProps>(
  ({ children, required, className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn('text-sm font-semibold text-gray-700 mb-2', className)}
      {...props}
    >
      {children}
      {required && <Text className="text-error-500 ml-1">*</Text>}
    </Text>
  )
);
Label.displayName = 'Label';

// Helper Text Component
export interface HelperTextProps extends TextProps {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
}

export const HelperText = React.forwardRef<Text, HelperTextProps>(
  ({ children, error, className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        'text-sm mt-1',
        error ? 'text-error-600 font-medium' : 'text-gray-600',
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
);
HelperText.displayName = 'HelperText';

// Link Text Component
export interface LinkTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
  underline?: boolean;
}

export const LinkText = React.forwardRef<Text, LinkTextProps>(
  ({ children, className, underline = false, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        'text-base font-semibold text-primary-600 active:text-primary-700',
        underline && 'underline',
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
);
LinkText.displayName = 'LinkText';

// Highlight Text Component
export interface HighlightTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const HighlightText = React.forwardRef<Text, HighlightTextProps>(
  ({ children, variant = 'primary', className, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary-100 text-primary-700',
      secondary: 'bg-secondary-100 text-secondary-700',
      success: 'bg-success-100 text-success-700',
      warning: 'bg-warning-100 text-warning-700',
      error: 'bg-error-100 text-error-700',
    };

    return (
      <Text
        ref={ref}
        className={cn(
          'px-2 py-0.5 rounded font-semibold',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </Text>
    );
  }
);
HighlightText.displayName = 'HighlightText';

// Monospace Text Component
export const MonospaceText = React.forwardRef<Text, TextProps>(
  ({ children, className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn('font-mono text-sm bg-gray-100 px-2 py-1 rounded', className)}
      {...props}
    >
      {children}
    </Text>
  )
);
MonospaceText.displayName = 'MonospaceText';