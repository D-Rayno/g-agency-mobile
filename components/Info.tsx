// components/Info.tsx
/**
 * Info/Alert Component with Animations
 * Pure NativeWind styling - no theme hooks
 */

import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui';

export interface InfoProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  icon?: {
    family: 'Feather';
    name: string;
    size?: number;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  actionButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  style?: any;
  visible?: boolean;
  animationDuration?: number;
}

export default function Info({
  type = 'info',
  title,
  message,
  icon,
  dismissible = false,
  onDismiss,
  actionButton,
  style,
  visible = true,
  animationDuration = 300,
}: InfoProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = React.useState(visible);

  // Animation effect
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Enter animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, slideAnim, fadeAnim, animationDuration]);

  const handleDismiss = () => {
    if (onDismiss) {
      // Trigger exit animation then call onDismiss
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
        onDismiss();
      });
    }
  };

  // Get colors based on type
  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          background: '#D1FAE5',
          border: '#A7F3D0',
          text: '#059669',
          icon: '#059669',
        };
      case 'warning':
        return {
          background: '#FEF3C7',
          border: '#FDE68A',
          text: '#D97706',
          icon: '#D97706',
        };
      case 'error':
        return {
          background: '#FEE2E2',
          border: '#FECACA',
          text: '#DC2626',
          icon: '#DC2626',
        };
      case 'info':
      default:
        return {
          background: '#DBEAFE',
          border: '#BFDBFE',
          text: '#2563EB',
          icon: '#2563EB',
        };
    }
  };

  // Get default icon based on type
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return { family: 'Feather' as const, name: 'check-circle', size: 20 };
      case 'warning':
        return { family: 'Feather' as const, name: 'alert-triangle', size: 20 };
      case 'error':
        return { family: 'Feather' as const, name: 'alert-circle', size: 20 };
      case 'info':
      default:
        return { family: 'Feather' as const, name: 'info', size: 20 };
    }
  };

  const typeColors = getTypeColors();
  const displayIcon = icon || getDefaultIcon();

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      className="border rounded-lg p-4 my-1"
      style={[
        {
          backgroundColor: typeColors.background,
          borderColor: typeColors.border,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <View className="flex-row items-start justify-between mb-0">
        <View className="flex-row items-start flex-1">
          {/* Icon */}
          <View className="mr-2 mt-0.5">
            <Feather
              name={displayIcon.name as any}
              size={displayIcon.size || 20}
              color={typeColors.icon}
            />
          </View>

          {/* Text Content */}
          <View className="flex-1">
            {title && (
              <Text
                className="text-base font-semibold mb-1"
                style={{ color: typeColors.text }}
              >
                {title}
              </Text>
            )}
            <Text className="text-sm leading-relaxed" style={{ color: typeColors.text }}>
              {message}
            </Text>
          </View>
        </View>

        {/* Right Actions */}
        <View className="flex-row items-start gap-1 ml-2">
          {dismissible && (
            <TouchableOpacity
              className="p-1 rounded"
              style={{ backgroundColor: typeColors.text + '10' }}
              onPress={handleDismiss}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={16} color={typeColors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Action Button */}
      {actionButton && (
        <View className="mt-2 items-start">
          <Button
            onPress={actionButton.onPress}
            variant={actionButton.variant || 'secondary'}
            size="sm"
          >
            {actionButton.title}
          </Button>
        </View>
      )}
    </Animated.View>
  );
}