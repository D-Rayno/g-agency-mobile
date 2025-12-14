// components/ui/FilterChip.tsx

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    Animated,
    Pressable, Text, View
} from 'react-native';
import { SearchBar } from './SearchBar';

export interface FilterChipProps extends Omit<React.ComponentProps<typeof Pressable>, 'children'> {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
  className?: string;
  hapticFeedback?: boolean;
  variant?: 'default' | 'outline';
}

export const FilterChip = React.forwardRef<View, FilterChipProps>(
  (
    {
      label,
      selected,
      onPress,
      icon,
      count,
      className,
      hapticFeedback = true,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    };

    const handlePress = () => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    };

    const variantStyles = {
      default: selected
        ? 'bg-primary-500 border-primary-500'
        : 'bg-white border-gray-300',
      outline: selected
        ? 'bg-primary-500 border-primary-500'
        : 'bg-transparent border-gray-300',
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          ref={ref}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={cn(
            'flex-row items-center justify-center px-4 py-2.5 rounded-xl border-2 min-h-[40px] shadow-sm',
            variantStyles[variant],
            className
          )}
          {...props}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={16}
              color={selected ? '#ffffff' : '#6b7280'}
              style={{ marginRight: label || count ? 6 : 0 }}
            />
          )}
          {label && (
            <Text
              className={cn(
                'text-sm font-semibold',
                selected ? 'text-white' : 'text-gray-700'
              )}
            >
              {label}
            </Text>
          )}
          {count !== undefined && count > 0 && (
            <View
              className={cn(
                'ml-2 px-2 py-0.5 rounded-full min-w-[20px] items-center',
                selected ? 'bg-white/20' : 'bg-gray-200'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-bold',
                  selected ? 'text-white' : 'text-gray-700'
                )}
              >
                {count > 99 ? '99+' : count}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

FilterChip.displayName = 'FilterChip';

// Filter Chip Group for managing multiple filters
export interface FilterChipGroupProps {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  children,
  className,
  horizontal = true,
}) => {
  return (
    <View
      className={cn(
        horizontal ? 'flex-row flex-wrap' : 'flex-col',
        'gap-2',
        className
      )}
    >
      {children}
    </View>
  );
};

FilterChipGroup.displayName = 'FilterChipGroup';

// Search with Filters - Combined component
export interface SearchWithFiltersProps {
  searchValue: string;
  onSearch: (query: string) => void;
  filters?: Array<{
    id: string;
    label: string;
    selected: boolean;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    count?: number;
  }>;
  showFilterButton?: boolean;
  onFilterButtonPress?: () => void;
  className?: string;
}

export const SearchWithFilters: React.FC<SearchWithFiltersProps> = ({
  searchValue,
  onSearch,
  filters,
  showFilterButton = false,
  onFilterButtonPress,
  className,
}) => {
  return (
    <View className={cn('gap-3', className)}>
      <SearchBar
        value={searchValue}
        onSearch={onSearch}
        showFilter={showFilterButton}
        onFilterPress={onFilterButtonPress}
      />
      {filters && filters.length > 0 && (
        <FilterChipGroup>
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              selected={filter.selected}
              onPress={filter.onPress}
              icon={filter.icon}
              count={filter.count}
            />
          ))}
        </FilterChipGroup>
      )}
    </View>
  );
};