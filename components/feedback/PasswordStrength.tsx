// components/feedback/PasswordStrength.tsx
/**
 * Password Strength Indicator with Requirements Checklist
 * Pure NativeWind styling - no theme hooks
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export const PasswordStrengthIndicator = memo(
  ({ password }: { password?: string }) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    const passwordStrength = useMemo(() => {
      if (!password)
        return { level: 0, label: '', color: '#E5E7EB', bgColor: '#E5E7EB' };

      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[@$!%*?&]/.test(password)) strength++;

      const levels = [
        { level: 0, label: '', color: '#E5E7EB', bgColor: '#E5E7EB' },
        { level: 1, label: 'Weak', color: '#EF4444', bgColor: '#FEE2E2' },
        { level: 2, label: 'Fair', color: '#F59E0B', bgColor: '#FEF3C7' },
        { level: 3, label: 'Good', color: '#3B82F6', bgColor: '#DBEAFE' },
        { level: 4, label: 'Strong', color: '#22C55E', bgColor: '#D1FAE5' },
        { level: 5, label: 'Very Strong', color: '#22C55E', bgColor: '#D1FAE5' },
      ];

      return levels[Math.min(strength, 5)];
    }, [password]);

    const passwordRequirements = useMemo(
      () => [
        { met: password && password.length >= 8, text: 'At least 8 characters' },
        { met: password && /[a-z]/.test(password), text: 'One lowercase letter' },
        { met: password && /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: password && /[0-9]/.test(password), text: 'One number' },
        {
          met: password && /[@$!%*?&]/.test(password),
          text: 'One special character (@$!%*?&)',
        },
      ],
      [password]
    );

    useEffect(() => {
      const targetWidth = (passwordStrength.level / 5) * 100;
      Animated.timing(animatedWidth, {
        toValue: targetWidth,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [passwordStrength.level, animatedWidth]);

    if (!password) return null;

    return (
      <View className="-mt-2 mb-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-sm font-semibold text-gray-800">
            Password Strength
          </Text>
          <Text
            className="text-sm font-bold"
            style={{ color: passwordStrength.color }}
          >
            {passwordStrength.label}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
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

        {/* Requirements */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            Password Requirements
          </Text>
          {passwordRequirements.map((req, index) => (
            <View key={index} className="flex-row items-center mb-1">
              <Text
                className="w-4 text-center mr-2 text-sm"
                style={{ color: req.met ? '#22C55E' : '#9CA3AF' }}
              >
                {req.met ? '✓' : '○'}
              </Text>
              <Text
                className={`flex-1 text-sm ${
                  req.met ? 'text-gray-800' : 'text-gray-500'
                }`}
              >
                {req.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.password === nextProps.password
);

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator';