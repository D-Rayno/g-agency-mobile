// components/cards/RegistrationCard.tsx
/**
 * Enhanced Registration Card Component
 * Modern design with refined styling and better visual hierarchy
 */

import { Card, PressableCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
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
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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
      <View className="flex-row justify-between items-center py-2.5 px-3 bg-gray-50 rounded-lg mb-2 border border-gray-100">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
            {registration.user?.fullName || 'Unknown User'}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Ionicons name="time-outline" size={12} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {formatDate(registration.createdAt)}
            </Text>
          </View>
        </View>
        <StatusBadge status={registration.status} size="sm" />
      </View>
    );
  }

  // Full version
  const CardComponent = onPress ? PressableCard : Card;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent className="mb-3" variant="elevated" {...cardProps}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          {/* Event Name */}
          {showEvent && registration.event && (
            <>
              <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={2}>
                {registration.event.name || 'Unknown Event'}
              </Text>
              <View className="h-px bg-gray-100 my-2" />
            </>
          )}

          {/* User Info */}
          {showUser && registration.user && (
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-2.5">
                <Ionicons name="person" size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-800">
                  {registration.user.fullName || 'Unknown User'}
                </Text>
                {registration.user.email && (
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {registration.user.email}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Registration Details */}
          <View className="space-y-1.5">
            {/* Registration Date */}
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-xs text-gray-600 ml-1.5">
                Registered: {formatDate(registration.createdAt)}
              </Text>
            </View>

            {/* Price */}
            {registration.price !== undefined && registration.price > 0 && (
              <View className="flex-row items-center">
                <Ionicons name="cash-outline" size={14} color="#10b981" />
                <Text className="text-xs font-semibold text-green-700 ml-1.5">
                  {formatPrice(registration.price)}
                </Text>
              </View>
            )}

            {/* Attended Info */}
            {registration.attendedAt && (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text className="text-xs text-green-700 ml-1.5">
                  Attended: {formatDate(registration.attendedAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Badge */}
        <StatusBadge status={registration.status} size="md" />
      </View>
    </CardComponent>
  );
}