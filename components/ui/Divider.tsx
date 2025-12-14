// Enhanced Divider Component
import { cn } from '@/utils/cn';
import { Ionicons as IonIcon } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
  label?: string;
  labelIcon?: keyof typeof IonIcon.glyphMap;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const Divider = React.forwardRef<View, DividerProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      thickness = 1,
      color = '#e5e7eb',
      label,
      labelIcon,
      className,
      spacing = 'md',
      ...props
    },
    ref
  ) => {
    const spacingStyles = {
      sm: 'my-2',
      md: 'my-4',
      lg: 'my-6',
    };

    if (label || labelIcon) {
      return (
        <View
          ref={ref}
          className={cn('flex-row items-center', spacingStyles[spacing], className)}
          {...props}
        >
          <View
            className="flex-1"
            style={{
              height: thickness,
              backgroundColor: color,
              borderStyle: variant === 'solid' ? 'solid' : variant,
            }}
          />
          <View className="flex-row items-center mx-4">
            {labelIcon && (
              <IonIcon
                name={labelIcon}
                size={16}
                color="#6b7280"
                style={{ marginRight: label ? 6 : 0 }}
              />
            )}
            {label && (
              <Text className="text-sm font-medium text-gray-600">{label}</Text>
            )}
          </View>
          <View
            className="flex-1"
            style={{
              height: thickness,
              backgroundColor: color,
              borderStyle: variant === 'solid' ? 'solid' : variant,
            }}
          />
        </View>
      );
    }

    return (
      <View
        ref={ref}
        className={cn(
          orientation === 'horizontal'
            ? `w-full ${spacingStyles[spacing]}`
            : 'h-full mx-2',
          className
        )}
        style={{
          [orientation === 'horizontal' ? 'height' : 'width']: thickness,
          backgroundColor: color,
          borderStyle: variant === 'solid' ? 'solid' : variant,
        }}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

// Gradient Divider
export interface GradientDividerProps extends ViewProps {
  colors?: string[];
  height?: number;
  className?: string;
}

export const GradientDivider = React.forwardRef<View, GradientDividerProps>(
  (
    {
      colors = ['transparent', '#4F46E5', 'transparent'],
      height = 2,
      className,
      ...props
    },
    ref
  ) => {
    const { LinearGradient } = require('expo-linear-gradient');
    
    return (
      <View ref={ref} className={cn('w-full my-4', className)} {...props}>
        <LinearGradient
          colors={colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height }}
        />
      </View>
    );
  }
);

GradientDivider.displayName = 'GradientDivider';