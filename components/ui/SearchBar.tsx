// components/ui/SearchBar.tsx
/**
 * Enhanced Search Bar Component
 * Modern search with filters and animations
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

export interface SearchBarProps extends Omit<TextInputProps, 'onChange'> {
  value: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  debounceMs?: number;
  containerClassName?: string;
  showClearButton?: boolean;
  showFilter?: boolean;
  onFilterPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const SearchBar = React.forwardRef<TextInput, SearchBarProps>(
  (
    {
      value,
      onSearch,
      onClear,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      debounceMs = 300,
      placeholder = 'Search...',
      containerClassName,
      showClearButton = true,
      showFilter = false,
      onFilterPress,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));

    // Debounce search
    useEffect(() => {
      const timer = setTimeout(() => {
        onSearch(localValue);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [localValue, debounceMs, onSearch]);

    // Sync with external value changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleFocus = () => {
      setIsFocused(true);
      onFocusProp?.();
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlurProp?.();
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    };

    const handleClear = () => {
      setLocalValue('');
      onClear?.();
      onSearch('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleFilterPress = () => {
      onFilterPress?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const variantStyles = {
      default: 'bg-gray-100 border-2 border-transparent',
      elevated: 'bg-white border-2 border-gray-200 shadow-md',
      outlined: 'bg-transparent border-2 border-gray-300',
    };

    return (
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className={cn(
          'flex-row items-center rounded-xl px-4 py-3 min-h-[52px] transition-all',
          variantStyles[variant],
          isFocused && 'border-primary-500 bg-primary-50/30 shadow-lg shadow-primary-100',
          containerClassName
        )}
      >
        {/* Search Icon */}
        <View className={cn(
          'w-10 h-10 rounded-full items-center justify-center mr-2',
          isFocused ? 'bg-primary-100' : 'bg-transparent'
        )}>
          <Ionicons
            name="search"
            size={20}
            color={isFocused ? '#4F46E5' : '#6b7280'}
          />
        </View>

        {/* Input */}
        <TextInput
          ref={ref}
          value={localValue}
          onChangeText={setLocalValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          className="flex-1 text-base text-gray-900 font-medium"
          {...props}
        />

        {/* Clear Button */}
        {showClearButton && localValue.length > 0 && (
          <Pressable
            onPress={handleClear}
            className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center ml-2 active:bg-gray-300"
          >
            <Ionicons name="close" size={16} color="#6b7280" />
          </Pressable>
        )}

        {/* Filter Button */}
        {showFilter && (
          <Pressable
            onPress={handleFilterPress}
            className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center ml-2 active:bg-primary-200"
          >
            <Ionicons name="options-outline" size={20} color="#4F46E5" />
          </Pressable>
        )}
      </Animated.View>
    );
  }
);

SearchBar.displayName = 'SearchBar';

