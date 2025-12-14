// components/cards/EventCard.tsx
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { BodyText, Caption } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { Event } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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
  const { colors, spacing } = useTheme();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'primary';
      case 'ongoing': return 'warning';
      case 'finished': return 'success';
      default: return 'secondary';
    }
  };

  const registeredCount = event.registeredCount || 0;
  const capacity = event.capacity || 0;
  const availableSeats = event.availableSeats || 0;
  const isFull = registeredCount >= capacity;

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps}>
      <Card className="mb-3 p-4">
        {/* Header: Title and Status Badge */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: spacing.sm 
        }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <BodyText weight="semibold" numberOfLines={1}>
              {event.name || 'Unnamed Event'}
            </BodyText>
            <Caption color="gray">
              {[event.category, event.province].filter(Boolean).join(' • ') || 'No location'}
            </Caption>
          </View>
          <Badge variant={getStatusVariant(event.status)} size="sm">
            {(event.status || 'unknown').toUpperCase()}
          </Badge>
        </View>

        {/* Registration Info */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: spacing.xs 
        }}>
          <Ionicons 
            name="people" 
            size={16} 
            color={colors.muted} 
            style={{ marginRight: 6 }} 
          />
          <Caption color="gray">
            {registeredCount}/{capacity} registered
          </Caption>
          <View style={{ 
            marginLeft: 12, 
            paddingHorizontal: 8, 
            paddingVertical: 2, 
            backgroundColor: isFull ? colors.danger + '20' : colors.success + '20',
            borderRadius: 4 
          }}>
            <Caption 
              style={{ 
                fontSize: 10, 
                color: isFull ? colors.danger : colors.success,
                fontWeight: '600'
              }}
            >
              {availableSeats > 0 ? `${availableSeats} seats left` : 'FULL'}
            </Caption>
          </View>
        </View>

        {/* Date Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={colors.muted} 
            style={{ marginRight: 6 }} 
          />
          <Caption color="gray">
            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'No date'}
          </Caption>
        </View>

        {/* Registrations Section (Optional) */}
        {showRegistrations && registeredCount > 0 && (
          <View style={{ 
            marginTop: spacing.sm, 
            paddingTop: spacing.sm, 
            borderTopWidth: 1, 
            borderTopColor: colors.border 
          }}>
            <TouchableOpacity
              onPress={onExpandRegistrations}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}
            >
              <Caption color="primary" weight="semibold">
                {registeredCount} Registration{registeredCount !== 1 ? 's' : ''}
              </Caption>
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>

            {isExpanded && registrationsPreview && (
              <View style={{ marginTop: spacing.sm }}>
                {registrationsPreview}
              </View>
            )}
          </View>
        )}
      </Card>
    </Wrapper>
  );
}
