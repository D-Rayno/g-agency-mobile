// components/cards/UserCard.tsx
/**
 * Enhanced User Card Component
 * Modern design with Avatar component integration
 */

import { Avatar } from '@/components/ui/Avatar';
import { Card, PressableCard } from '@/components/ui/Card';
import { User } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export interface UserCardProps {
  user: User;
  onPress?: () => void;
  showDetails?: boolean;
}

export function UserCard({ user, onPress, showDetails = true }: UserCardProps) {
  const displayName =
    user.fullName ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'Unnamed User';
  const displayEmail = user.email || 'No email';

  const CardComponent = onPress ? PressableCard : Card;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent className="mb-3" variant="elevated" {...cardProps}>
      <View className="flex-row items-start">
        <Avatar
          source={user.avatarUrl ? getImageUrl(user.avatarUrl) || undefined : undefined}
          name={displayName}
          size="lg"
          className="mr-3"
          fallbackBgColor="#4F46E5"
        />
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text className="text-base font-bold text-gray-800 flex-1 mr-2">{displayName}</Text>
            {user.isEmailVerified && (
              <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                <Text className="text-xs font-semibold text-green-700 ml-1">Verified</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="mail-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1.5" numberOfLines={1}>{displayEmail}</Text>
          </View>
          {showDetails && user.phoneNumber && (
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={14} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1.5">{user.phoneNumber}</Text>
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