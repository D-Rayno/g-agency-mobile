// components/cards/EventCard.tsx
/**
 * Enhanced Event Card Component
 * Modern design with smooth animations and refined styling
 */

import { CapacityIndicator } from '@/components/ui/CapacityIndicator';
import { Card, PressableCard } from '@/components/ui/Card';
import { DateRangeDisplay } from '@/components/ui/DateRangeDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Event } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

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
  const [rotateAnim] = useState(new Animated.Value(0));
  const registeredCount = event.registeredCount || 0;
  const capacity = event.capacity || 0;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const CardComponent = onPress ? PressableCard : Card;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent 
      className="mb-3" 
      variant="elevated"
      {...cardProps}
    >
      {/* Header: Title and Status Badge */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2}>
            {event.name || 'Unnamed Event'}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500 ml-1.5" numberOfLines={1}>
              {[event.category, event.province].filter(Boolean).join(' • ') || 'No location'}
            </Text>
          </View>
        </View>
        <StatusBadge status={event.status} size="sm" />
      </View>

      {/* Date Range */}
      <View className="mb-3">
        <DateRangeDisplay
          startDate={event.startDate}
          endDate={event.endDate}
          format="short"
          showTime={false}
        />
      </View>

      {/* Capacity Indicator */}
      <CapacityIndicator
        current={registeredCount}
        max={capacity}
        variant="bar"
        showPercentage
      />

      {/* Registrations Section (Optional) */}
      {showRegistrations && registeredCount > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={onExpandRegistrations}
            className="flex-row items-center justify-between active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2.5">
                <Ionicons name="people" size={16} color="#6366f1" />
              </View>
              <Text className="text-sm font-semibold text-gray-800">
                {registeredCount} Registration{registeredCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </Animated.View>
          </TouchableOpacity>

          {isExpanded && registrationsPreview && (
            <View className="mt-3">{registrationsPreview}</View>
          )}
        </View>
      )}
    </CardComponent>
  );
}