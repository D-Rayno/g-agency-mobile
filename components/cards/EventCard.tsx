// components/cards/EventCard.tsx
/**
 * Event Card Component
 * Pure NativeWind styling - no theme hooks
 */

import { CapacityIndicator } from '@/components/ui/CapacityIndicator';
import { Card, PressableCard } from '@/components/ui/Card';
import { DateRangeDisplay } from '@/components/ui/DateRangeDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Event } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface EventCardProps {
  event: Event;
  onPress?: () => void;
  showRegistrations?: boolean;
  onExpandRegistrations?: () => void;
  isExpanded?: boolean;
  registrationsPreview?: React.ReactNode;
}

export function EventCard({
  event,
  onPress,
  showRegistrations = false,
  onExpandRegistrations,
  isExpanded = false,
  registrationsPreview,
}: EventCardProps) {
  const registeredCount = event.registeredCount || 0;
  const capacity = event.capacity || 0;

  const CardComponent = onPress ? PressableCard : Card;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent className="mb-3 p-4" {...cardProps}>
      {/* Header: Title and Status Badge */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
            {event.name || 'Unnamed Event'}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {[event.category, event.province].filter(Boolean).join(' • ') || 'No location'}
          </Text>
        </View>
        <StatusBadge status={event.status} size="sm" />
      </View>

      {/* Date Range */}
      <DateRangeDisplay
        startDate={event.startDate}
        endDate={event.endDate}
        format="short"
        showTime={false}
        className="mb-2"
      />

      {/* Capacity Indicator */}
      <CapacityIndicator
        current={registeredCount}
        max={capacity}
        variant="bar"
        showPercentage
      />

      {/* Registrations Section (Optional) */}
      {showRegistrations && registeredCount > 0 && (
        <View className="mt-2 pt-2 border-t border-gray-200">
          <TouchableOpacity
            onPress={onExpandRegistrations}
            className="flex-row items-center justify-between"
          >
            <Text className="text-sm font-semibold text-primary-600">
              {registeredCount} Registration{registeredCount !== 1 ? 's' : ''}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>

          {isExpanded && registrationsPreview && (
            <View className="mt-2">{registrationsPreview}</View>
          )}
        </View>
      )}
    </CardComponent>
  );
}
