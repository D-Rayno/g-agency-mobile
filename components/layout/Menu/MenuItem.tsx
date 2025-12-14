// components/layout/Menu/MenuItem.tsx
/**
 * Enhanced Menu Item Component for Settings/Profile Menus
 * Modern design with smooth animations and refined styling
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

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
    const [scaleAnim] = useState(new Animated.Value(1));
    const isDanger = variant === 'danger';
    
    const iconColor = isDanger ? '#f43f5e' : '#6366f1';
    const titleColor = isDanger ? '#f43f5e' : '#1f2937';
    const iconBgColor = isDanger ? '#fee2e2' : '#eef2ff';

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          className={cn(
            'flex-row items-center py-3.5 px-4 bg-white rounded-xl border border-gray-100',
            disabled && 'opacity-50'
          )}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          disabled={disabled}
        >
          {/* Icon Container */}
          <View
            className="w-11 h-11 rounded-xl justify-center items-center mr-3.5"
            style={{ backgroundColor: iconBgColor }}
          >
            <Ionicons name={icon as any} size={22} color={iconColor} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text 
              className="text-base font-semibold mb-0.5" 
              style={{ color: titleColor }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text className="text-sm text-gray-500 font-normal leading-tight">
                {subtitle}
              </Text>
            )}
          </View>

          {/* Arrow */}
          {showArrow && (
            <View className="ml-2">
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#9ca3af" 
              />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

MenuItem.displayName = 'MenuItem';