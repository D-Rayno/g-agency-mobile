// components/cards/RegistrationCard.tsx
/**
 * Registration Card Component
 * Pure NativeWind styling - no theme hooks
 */

import { Card, PressableCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Registration } from '@/types/admin';
import React from 'react';
import { Text, View } from 'react-native';

export interface RegistrationCardProps {
  registration: Registration;
  onPress?: () => void;
  showEvent?: boolean;
  showUser?: boolean;
  compact?: boolean;
}

export function RegistrationCard({
  registration,
  onPress,
  showEvent = true,
  showUser = true,
  compact = false,
}: RegistrationCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  const formatPrice = (priceInCentimes: number) => {
    return (priceInCentimes / 100).toFixed(2) + ' DZD';
  };

  // Compact version for nested displays
  if (compact) {
    return (
      <View className="flex-row justify-between items-center py-1.5 px-2 bg-gray-50 rounded-md mb-1">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-800">
            {registration.user?.fullName || 'Unknown User'}
          </Text>
          <Text className="text-2xs text-gray-500">{formatDate(registration.createdAt)}</Text>
        </View>
        <StatusBadge status={registration.status} size="sm" />
      </View>
    );
  }

  // Full version
  const CardComponent = onPress ? PressableCard : Card;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent className="mb-3 p-3" {...cardProps}>
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-2">
          {/* Event Name */}
          {showEvent && registration.event && (
            <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
              {registration.event.name || 'Unknown Event'}
            </Text>
          )}

          {/* User Name */}
          {showUser && registration.user && (
            <Text className="text-sm text-gray-600 mt-0.5">
              {registration.user.fullName || 'Unknown User'}
            </Text>
          )}

          {/* Registration Date */}
          <Text className="text-2xs text-gray-500 mt-1">
            {formatDate(registration.createdAt)}
          </Text>

          {/* Price */}
          {registration.price !== undefined && registration.price > 0 && (
            <Text className="text-2xs font-semibold text-primary-600 mt-0.5">
              {formatPrice(registration.price)}
            </Text>
          )}
        </View>

        {/* Status Badge */}
        <StatusBadge status={registration.status} size="sm" />
      </View>

      {/* Attended Info */}
      {registration.attendedAt && (
        <View className="mt-2 pt-2 border-t border-gray-200">
          <Text className="text-2xs text-success-700">
            ✓ Attended: {formatDate(registration.attendedAt)}
          </Text>
        </View>
      )}
    </CardComponent>
  );
}
