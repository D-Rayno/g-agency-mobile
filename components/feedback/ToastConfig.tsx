// components/feedback/ToastConfig.tsx
/**
 * Enhanced Toast Configuration
 * Modern design with refined animations and sophisticated styling
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// Custom toast component with modern styling
const CustomToast = ({
  type,
  text1,
  text2,
  onPress,
}: {
  type: 'success' | 'error' | 'info' | 'warning';
  text1?: string;
  text2?: string;
  onPress?: () => void;
}) => {
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgGradient: ['#f0fdf4', '#dcfce7'],
          borderColor: 'border-green-500',
          iconBg: 'bg-green-500',
          iconName: 'checkmark-circle' as const,
          iconColor: '#ffffff',
          textColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          accentColor: '#22c55e',
        };
      case 'error':
        return {
          bgGradient: ['#fef2f2', '#fee2e2'],
          borderColor: 'border-rose-500',
          iconBg: 'bg-rose-500',
          iconName: 'close-circle' as const,
          iconColor: '#ffffff',
          textColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          accentColor: '#f43f5e',
        };
      case 'warning':
        return {
          bgGradient: ['#fffbeb', '#fef3c7'],
          borderColor: 'border-amber-500',
          iconBg: 'bg-amber-500',
          iconName: 'warning' as const,
          iconColor: '#ffffff',
          textColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          accentColor: '#f59e0b',
        };
      case 'info':
      default:
        return {
          bgGradient: ['#eef2ff', '#e0e7ff'],
          borderColor: 'border-indigo-500',
          iconBg: 'bg-indigo-500',
          iconName: 'information-circle' as const,
          iconColor: '#ffffff',
          textColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          accentColor: '#6366f1',
        };
    }
  };

  const config = getToastConfig();

  return (
    <TouchableOpacity
      className={cn(
        'mx-4 rounded-2xl border-l-[5px] flex-row items-center px-4 py-4 bg-white',
        config.borderColor
      )}
      style={{
        width: width - 32,
        minHeight: 72,
        shadowColor: config.accentColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      {/* Icon Container with Pulse Effect */}
      <View 
        className={cn('w-12 h-12 rounded-full items-center justify-center mr-3.5', config.iconBg)}
        style={{
          shadowColor: config.accentColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Ionicons name={config.iconName} size={24} color={config.iconColor} />
      </View>

      {/* Content */}
      <View className="flex-1">
        {text1 && (
          <Text className={cn('text-base font-bold mb-0.5', config.textColor)} numberOfLines={2}>
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className={cn('text-sm font-normal leading-tight', config.messageColor)} numberOfLines={3}>
            {text2}
          </Text>
        )}
      </View>

      {/* Close Button (optional) */}
      {onPress && (
        <View className="ml-2">
          <Ionicons name="close" size={20} color="#9ca3af" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Create the toast configuration
export const toastConfig: ToastConfig = {
  success: (props) => (
    <CustomToast
      type="success"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
  error: (props) => (
    <CustomToast
      type="error"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
  info: (props) => (
    <CustomToast
      type="info"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
  warning: (props) => (
    <CustomToast
      type="warning"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
};

export default toastConfig;