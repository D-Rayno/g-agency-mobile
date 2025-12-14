// components/ui/FilterChip.tsx
import { cn } from '@/utils/cn';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps, Text, View } from 'react-native';

export interface FilterChipProps extends Omit<PressableProps, 'children'> {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  className?: string;
  hapticFeedback?: boolean;
}

export const FilterChip = React.forwardRef<View, FilterChipProps>(
  (
    {
      label,
      selected,
      onPress,
      icon,
      className,
      hapticFeedback = true,
      ...props
    },
    ref
  ) => {
    const handlePress = () => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        className={cn(
          'flex-row items-center justify-center px-4 py-2 rounded-full border-2 min-h-[36px]',
          selected
            ? 'bg-primary-500 border-primary-500'
            : 'bg-transparent border-gray-300',
          className
        )}
        {...props}
      >
        {icon && (
          <View className={cn('mr-1.5', selected ? 'opacity-100' : 'opacity-60')}>
            {icon}
          </View>
        )}
        <Text
          className={cn(
            'text-sm font-medium',
            selected ? 'text-white' : 'text-gray-700'
          )}
        >
          {label}
        </Text>
      </Pressable>
    );
  }
);

FilterChip.displayName = 'FilterChip';

// Chip Group for managing multiple filters
export interface FilterChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  children,
  className,
}) => {
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {children}
    </View>
  );
};

FilterChipGroup.displayName = 'FilterChipGroup';
