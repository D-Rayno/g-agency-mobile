// components/cards/RegistrationCard.tsx
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { BodyText, Caption } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { Registration } from '@/types/admin';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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
  compact = false
}: RegistrationCardProps) {
  const { colors, spacing } = useTheme();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'attended': return 'primary';
      case 'canceled': return 'error';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  // Compact version for nested displays
  if (compact) {
    return (
      <View 
        style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingVertical: 6,
          paddingHorizontal: 8,
          backgroundColor: colors.background,
          borderRadius: 6,
          marginBottom: 4
        }}
      >
        <View style={{ flex: 1 }}>
          <Caption weight="semibold">
            {registration.user?.fullName || 'Unknown User'}
          </Caption>
          <Caption color="gray" style={{ fontSize: 10 }}>
            {formatDate(registration.createdAt)}
          </Caption>
        </View>
        <Badge variant={getStatusVariant(registration.status)} size="sm">
          {(registration.status || 'unknown').toUpperCase()}
        </Badge>
      </View>
    );
  }

  // Full version
  return (
    <Wrapper {...wrapperProps}>
      <Card className="mb-3 p-3">
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            {showEvent && registration.event && (
              <BodyText weight="semibold" numberOfLines={1}>
                {registration.event.name || 'Unknown Event'}
              </BodyText>
            )}
            {showUser && registration.user && (
              <Caption color="gray">
                {registration.user.fullName || 'Unknown User'}
              </Caption>
            )}
            <Caption color="gray" style={{ fontSize: 10 }}>
              {formatDate(registration.createdAt)}
            </Caption>
            {registration.price !== undefined && registration.price > 0 && (
              <Caption color="primary" weight="semibold" style={{ fontSize: 10, marginTop: 2 }}>
                ${registration.price.toFixed(2)}
              </Caption>
            )}
          </View>
          <Badge variant={getStatusVariant(registration.status)} size="sm">
            {(registration.status || 'unknown').toUpperCase()}
          </Badge>
        </View>

        {/* Additional Info */}
        {registration.attendedAt && (
          <View style={{ 
            marginTop: spacing.xs, 
            paddingTop: spacing.xs, 
            borderTopWidth: 1, 
            borderTopColor: colors.border 
          }}>
            <Caption color="success" style={{ fontSize: 10 }}>
              {`✓ Attended: ${formatDate(registration.attendedAt)}`}
            </Caption>
          </View>
        )}
      </Card>
    </Wrapper>
  );
}
