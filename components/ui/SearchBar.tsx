// components/ui/SearchBar.tsx
import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View
} from 'react-native';

export interface SearchBarProps extends Omit<TextInputProps, 'onChange'> {
  value: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  containerClassName?: string;
  showClearButton?: boolean;
}

export const SearchBar = React.forwardRef<TextInput, SearchBarProps>(
  (
    {
      value,
      onSearch,
      onClear,
      debounceMs = 300,
      placeholder = 'Search...',
      containerClassName,
      showClearButton = true,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value);

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

    const handleClear = () => {
      setLocalValue('');
      onClear?.();
      onSearch('');
    };

    return (
      <View
        className={cn(
          'flex-row items-center bg-gray-100 rounded-full px-4 py-2.5 min-h-[44px]',
          containerClassName
        )}
      >
        {/* Search Icon */}
        <Ionicons name="search" size={20} color="#6b7280" />

        {/* Input */}
        <TextInput
          ref={ref}
          value={localValue}
          onChangeText={setLocalValue}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          className="flex-1 ml-2 text-base text-gray-900"
          {...props}
        />

        {/* Clear Button */}
        {showClearButton && localValue.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="ml-2 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

SearchBar.displayName = 'SearchBar';
