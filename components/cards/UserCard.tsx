// components/cards/UserCard.tsx
/**
 * User Card Component
 * Pure NativeWind styling - no theme hooks
 */

import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { User } from '@/types/admin';
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

  // Pre-compute display values to avoid any rendering issues
  const displayName =
    user.fullName ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'Unnamed User';
  const displayEmail = user.email || 'No email';
  const initials = getInitials();

  const CardComponent = onPress ? PressableCard : Card;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent className="mb-3 p-3" {...cardProps}>
      <View className="flex-row items-center">
        {/* Avatar Circle */}
        <View className="w-10 h-10 rounded-full bg-primary-100 justify-center items-center mr-2">
          <Text className="text-primary-600 font-bold text-base">{initials}</Text>
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{displayName}</Text>
          <Text className="text-sm text-gray-600 mt-0.5">{displayEmail}</Text>
          {showDetails && user.phoneNumber && (
            <Text className="text-2xs text-gray-500 mt-0.5">{user.phoneNumber}</Text>
          )}
        </View>

        {/* Verified Badge */}
        {user.isEmailVerified && (
          <Badge variant="success" size="sm">
            VERIFIED
          </Badge>
        )}
      </View>

      {/* Additional Details */}
      {showDetails && (
        <View className="mt-2 pt-2 border-t border-gray-200 flex-row justify-between">
          {user.province && (
            <Text className="text-sm text-gray-600">
              📍 {user.province}
              {user.commune ? `, ${user.commune}` : ''}
            </Text>
          )}
          {user.registrationsCount !== undefined && user.registrationsCount > 0 && (
            <Text className="text-sm font-semibold text-primary-600">
              {user.registrationsCount} event{user.registrationsCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}
    </CardComponent>
  );
}
