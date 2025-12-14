// components/layout/Menu/MenuItem.tsx
/**
 * Menu Item Component for Settings/Profile Menus
 * Pure NativeWind styling - no theme hooks
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type MenuItemProps = {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  showArrow?: boolean;
};

export const MenuItem = memo(
  ({
    title,
    subtitle,
    icon,
    onPress,
    variant = 'default',
    disabled = false,
    showArrow = true,
  }: MenuItemProps) => {
    const isDanger = variant === 'danger';
    const iconColor = isDanger ? '#EF4444' : '#4F46E5';
    const titleColor = isDanger ? '#EF4444' : '#1F2937';
    const iconBgColor = isDanger ? '#FEE2E2' : '#EEF2FF';

    return (
      <TouchableOpacity
        className={cn(
          'flex-row items-center py-4 px-4 bg-white rounded-xl shadow-sm',
          disabled && 'opacity-50'
        )}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {/* Icon Container */}
        <View
          className="w-11 h-11 rounded-lg justify-center items-center mr-4"
          style={{ backgroundColor: iconBgColor }}
        >
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-base font-semibold" style={{ color: titleColor }}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm text-gray-500 leading-4 mt-0.5">{subtitle}</Text>
          )}
        </View>

        {/* Arrow */}
        {showArrow && (
          <View className="ml-2 opacity-60">
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

MenuItem.displayName = 'MenuItem';