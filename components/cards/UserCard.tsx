// components/cards/UserCard.tsx
/**
 * Enhanced User Card Component
 * Modern design with refined styling and better visual hierarchy
 */

import { Card, PressableCard } from '@/components/ui/Card';
import { User } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export interface UserCardProps {
  user: User;
  onPress?: () => void;
  showDetails?: boolean;
}

export function UserCard({ user, onPress, showDetails = true }: UserCardProps) {
  // Safely extract initials
  const getInitials = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const initials = firstInitial + lastInitial;
    return initials || '?';
  };

  // Pre-compute display values
  const displayName =
    user.fullName ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'Unnamed User';
  const displayEmail = user.email || 'No email';
  const initials = getInitials();

  const CardComponent = onPress ? PressableCard : Card;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent className="mb-3" variant="elevated" {...cardProps}>
      <View className="flex-row items-start">
        {/* Avatar Circle with Gradient Border */}
        <View 
          className="mr-3"
          style={{
            shadowColor: '#6366f1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 justify-center items-center">
            <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
              <Text className="text-indigo-600 font-bold text-lg">{initials}</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text className="text-base font-bold text-gray-800 flex-1 mr-2">
              {displayName}
            </Text>
            {/* Verified Badge */}
            {user.isEmailVerified && (
              <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                <Text className="text-xs font-semibold text-green-700 ml-1">
                  Verified
                </Text>
              </View>
            )}
          </View>

          {/* Email */}
          <View className="flex-row items-center mb-1">
            <Ionicons name="mail-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1.5" numberOfLines={1}>
              {displayEmail}
            </Text>
          </View>

          {/* Phone Number */}
          {showDetails && user.phoneNumber && (
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={14} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1.5">
                {user.phoneNumber}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Additional Details */}
      {showDetails && (user.province || user.registrationsCount) && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row justify-between items-center">
            {/* Location */}
            {user.province && (
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center mr-2">
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                </View>
                <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
                  {user.province}
                  {user.commune ? `, ${user.commune}` : ''}
                </Text>
              </View>
            )}

            {/* Registration Count */}
            {user.registrationsCount !== undefined && user.registrationsCount > 0 && (
              <View className="flex-row items-center bg-indigo-50 px-3 py-1.5 rounded-lg">
                <Ionicons name="calendar-outline" size={14} color="#6366f1" />
                <Text className="text-sm font-semibold text-indigo-700 ml-1.5">
                  {user.registrationsCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </CardComponent>
  );
}