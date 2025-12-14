// components/feedback/PasswordStrength.tsx
/**
 * Enhanced Password Strength Indicator with Requirements Checklist
 * Modern design with refined animations and sophisticated styling
 */

import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

interface PasswordStrengthProps {
  password?: string;
  showRequirements?: boolean;
  compact?: boolean;
}

export const PasswordStrengthIndicator = memo(
  ({ password, showRequirements = true, compact = false }: PasswordStrengthProps) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;
    const requirementAnims = useRef(
      Array.from({ length: 5 }, () => new Animated.Value(0))
    ).current;

    const passwordStrength = useMemo(() => {
      if (!password)
        return { 
          level: 0, 
          label: '', 
          color: '#e5e7eb', 
          bgColor: '#f3f4f6',
          labelColor: '#9ca3af'
        };

      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[@$!%*?&]/.test(password)) strength++;

      const levels = [
        { 
          level: 0, 
          label: '', 
          color: '#e5e7eb', 
          bgColor: '#f3f4f6',
          labelColor: '#9ca3af'
        },
        { 
          level: 1, 
          label: 'Weak', 
          color: '#ef4444', 
          bgColor: '#fee2e2',
          labelColor: '#ef4444'
        },
        { 
          level: 2, 
          label: 'Fair', 
          color: '#f59e0b', 
          bgColor: '#fef3c7',
          labelColor: '#f59e0b'
        },
        { 
          level: 3, 
          label: 'Good', 
          color: '#3b82f6', 
          bgColor: '#dbeafe',
          labelColor: '#3b82f6'
        },
        { 
          level: 4, 
          label: 'Strong', 
          color: '#10b981', 
          bgColor: '#d1fae5',
          labelColor: '#10b981'
        },
        { 
          level: 5, 
          label: 'Very Strong', 
          color: '#22c55e', 
          bgColor: '#dcfce7',
          labelColor: '#22c55e'
        },
      ];

      return levels[Math.min(strength, 5)];
    }, [password]);

    const passwordRequirements = useMemo(
      () => [
        { 
          met: password && password.length >= 8, 
          text: 'At least 8 characters',
          icon: 'text-outline' as const
        },
        { 
          met: password && /[a-z]/.test(password), 
          text: 'One lowercase letter',
          icon: 'text' as const
        },
        { 
          met: password && /[A-Z]/.test(password), 
          text: 'One uppercase letter',
          icon: 'text' as const
        },
        { 
          met: password && /[0-9]/.test(password), 
          text: 'One number',
          icon: 'keypad-outline' as const
        },
        {
          met: password && /[@$!%*?&]/.test(password),
          text: 'One special character',
          icon: 'at-outline' as const
        },
      ],
      [password]
    );

    useEffect(() => {
      const targetWidth = (passwordStrength.level / 5) * 100;
      Animated.spring(animatedWidth, {
        toValue: targetWidth,
        useNativeDriver: false,
        speed: 12,
        bounciness: 8,
      }).start();
    }, [passwordStrength.level]);

    useEffect(() => {
      // Animate requirements check marks
      passwordRequirements.forEach((req, index) => {
        Animated.spring(requirementAnims[index], {
          toValue: req.met ? 1 : 0,
          useNativeDriver: true,
          speed: 50,
          bounciness: 10,
        }).start();
      });
    }, [passwordRequirements]);

    if (!password) return null;

    // Compact version - just the bar
    if (compact) {
      return (
        <View className="mt-2 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-semibold text-gray-700">
              Password Strength
            </Text>
            <Text
              className="text-sm font-bold"
              style={{ color: passwordStrength.labelColor }}
            >
              {passwordStrength.label}
            </Text>
          </View>
          <View 
            className="h-2 bg-gray-100 rounded-full overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 1,
              elevation: 1,
            }}
          >
            <Animated.View
              className="h-full rounded-full"
              style={{
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: passwordStrength.color,
              }}
            />
          </View>
        </View>
      );
    }

    // Full version with requirements
    return (
      <View className="mt-2 mb-4">
        {/* Strength Bar */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-bold text-gray-800">
              Password Strength
            </Text>
            <View 
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: passwordStrength.bgColor }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: passwordStrength.labelColor }}
              >
                {passwordStrength.label}
              </Text>
            </View>
          </View>
          <View 
            className="h-2.5 bg-gray-100 rounded-full overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Animated.View
              className="h-full rounded-full"
              style={{
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: passwordStrength.color,
              }}
            />
          </View>
        </View>

        {/* Requirements Card */}
        {showRequirements && (
          <View 
            className="bg-white rounded-xl p-4 border border-gray-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-base font-bold text-gray-800 mb-3">
              Password Requirements
            </Text>
            <View className="space-y-2">
              {passwordRequirements.map((req, index) => {
                const scale = requirementAnims[index];
                return (
                  <View key={index} className="flex-row items-center mb-2">
                    <Animated.View
                      className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                        req.met ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                      style={{
                        transform: [{ scale }],
                      }}
                    >
                      <Ionicons
                        name={req.met ? 'checkmark' : 'ellipse-outline'}
                        size={16}
                        color={req.met ? '#22c55e' : '#9ca3af'}
                      />
                    </Animated.View>
                    <Text
                      className={`flex-1 text-sm font-medium ${
                        req.met ? 'text-gray-800' : 'text-gray-500'
                      }`}
                    >
                      {req.text}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.password === nextProps.password
);

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator';

export default PasswordStrengthIndicator;