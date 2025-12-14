// components/cards/UserCard.tsx
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { BodyText, Caption } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { User } from '@/types/admin';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface UserCardProps {
  user: User;
  onPress?: () => void;
  showDetails?: boolean;
}

export function UserCard({ user,  onPress, showDetails = true }: UserCardProps) {
  const { colors, spacing } = useTheme();

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
  const displayName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';
  const displayEmail = user.email || 'No email';
  const initials = getInitials();

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps}>
      <Card style={{ marginBottom: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Avatar Circle */}
          <View style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.primary + '20', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: spacing.sm 
          }}>
            <Text style={{ 
              color: colors.primary,
              fontWeight: 'bold',
              fontSize: 16
            }}>
              {initials}
            </Text>
          </View>

          {/* User Info */}
          <View style={{ flex: 1 }}>
            <BodyText weight="semibold">
              {displayName}
            </BodyText>
            <Caption color="gray">
              {displayEmail}
            </Caption>
            {showDetails && user.phoneNumber && (
              <Caption color="gray" style={{ fontSize: 10 }}>
                {user.phoneNumber}
              </Caption>
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
          <View style={{ 
            marginTop: spacing.sm, 
            paddingTop: spacing.sm, 
            borderTopWidth: 1, 
            borderTopColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            {user.province && (
              <Caption color="gray">
                {`📍 ${user.province}${user.commune ? `, ${user.commune}` : ''}`}
              </Caption>
            )}
            {user.registrationsCount !== undefined && user.registrationsCount > 0 && (
              <Caption color="primary" weight="semibold">
                {user.registrationsCount} event{user.registrationsCount !== 1 ? 's' : ''}
              </Caption>
            )}
          </View>
        )}
      </Card>
    </Wrapper>
  );
}
