// components/ui/Divider.tsx
import { cn } from '@/utils/cn';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed';
  thickness?: number;
  color?: string;
  label?: string;
  className?: string;
}

export const Divider = React.forwardRef<View, DividerProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      thickness = 1,
      color = '#e5e7eb',
      label,
      className,
      ...props
    },
    ref
  ) => {
    if (label) {
      return (
        <View
          ref={ref}
          className={cn('flex-row items-center my-4', className)}
          {...props}
        >
          <View
            className="flex-1"
            style={{
              height: thickness,
              backgroundColor: color,
              borderStyle: variant,
            }}
          />
          <Text className="mx-4 text-sm text-gray-500">{label}</Text>
          <View
            className="flex-1"
            style={{
              height: thickness,
              backgroundColor: color,
              borderStyle: variant,
            }}
          />
        </View>
      );
    }

    return (
      <View
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'w-full my-2' : 'h-full mx-2',
          className
        )}
        style={{
          [orientation === 'horizontal' ? 'height' : 'width']: thickness,
          backgroundColor: color,
          borderStyle: variant,
        }}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
