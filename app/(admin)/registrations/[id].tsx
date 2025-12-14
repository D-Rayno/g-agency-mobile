// app/(admin)/registrations/[id].tsx
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Caption, Heading3 } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegistrationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRegistration = async (isRefresh = false) => {
    if (!id) return;

    try {
      if (!isRefresh) setLoading(true);

      const response = await adminApi.getRegistration(Number(id));
      
      if (response.success && response.data) {
        setRegistration(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load registration details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRegistration();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRegistration(true);
  };

  const handleCancel = () => {
    if (!registration) return;

    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel this registration?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.cancelRegistration(registration.id);
              Alert.alert('Success', 'Registration canceled successfully');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel registration');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended': return 'success';
      case 'confirmed': return 'primary';
      case 'canceled': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading || !registration) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <BodyText weight="semibold">Registration Details</BodyText>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Status Badge */}
        <View style={{ alignItems: 'center', padding: spacing.lg }}>
          <Badge variant={getStatusColor(registration.status) as any} size="lg">
            {registration.status.toUpperCase()}
          </Badge>
        </View>

        {/* QR Code */}
        {registration.status !== 'canceled' && (
          <Card className="mx-4 mb-4 p-4">
            <View style={{ alignItems: 'center' }}>
              <Heading3 className="mb-4">QR Code</Heading3>
              <View style={[styles.qrCodeContainer, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                <Ionicons name="qr-code-outline" size={120} color={colors.primary} />
              </View>
              <View style={{ 
                marginTop: spacing.md, 
                padding: spacing.sm, 
                backgroundColor: colors.muted + '20',
                borderRadius: 8,
                maxWidth: '90%'
              }}>
                <Caption color="gray" className="text-center" numberOfLines={2}>
                  {registration.qrCode}
                </Caption>
              </View>
              <Caption color="gray" className="mt-2 text-center">
                Scan this code at the event entrance
              </Caption>
            </View>
          </Card>
        )}

        {/* Event Information */}
        <Card className="mx-4 mb-4 p-4">
          <Heading3 className="mb-3">Event Details</Heading3>
          <TouchableOpacity onPress={() => router.push(`/(admin)/events/${registration.eventId}` as any)}>
            <InfoRow
              icon="calendar-outline"
              label="Event Name"
              value={registration.event?.name || 'Unknown Event'}
              showChevron
            />
          </TouchableOpacity>
          <InfoRow
            icon="location-outline"
            label="Location"
            value={registration.event?.location || 'N/A'}
          />
          <InfoRow
            icon="time-outline"
            label="Start Date"
            value={registration.event ? new Date(registration.event.startDate).toLocaleString() : 'N/A'}
          />
          <InfoRow
            icon="time-outline"
            label="End Date"
            value={registration.event ? new Date(registration.event.endDate).toLocaleString() : 'N/A'}
          />
        </Card>

        {/* User Information */}
        <Card className="mx-4 mb-4 p-4">
          <Heading3 className="mb-3">Participant Details</Heading3>
          <TouchableOpacity onPress={() => router.push(`/(admin)/users/${registration.userId}` as any)}>
            <InfoRow
              icon="person-outline"
              label="Name"
              value={registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User'}
              showChevron
            />
          </TouchableOpacity>
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={registration.user?.email || 'N/A'}
          />
          {registration.user?.phoneNumber && (
            <InfoRow
              icon="call-outline"
              label="Phone"
              value={registration.user.phoneNumber}
            />
          )}
        </Card>

        {/* Registration Information */}
        <Card className="mx-4 mb-4 p-4">
          <Heading3 className="mb-3">Registration Info</Heading3>
          <InfoRow icon="cash-outline" label="Price Paid" value={`${registration.price} DA`} />
          <InfoRow
            icon="calendar-outline"
            label="Registered On"
            value={new Date(registration.createdAt).toLocaleString()}
          />
          {registration.attendedAt && (
            <InfoRow
              icon="checkmark-circle-outline"
              label="Attended On"
              value={new Date(registration.attendedAt).toLocaleString()}
            />
          )}
          {registration.updatedAt && (
            <InfoRow
              icon="time-outline"
              label="Last Updated"
              value={new Date(registration.updatedAt).toLocaleString()}
            />
          )}
        </Card>

        {/* Actions */}
        {registration.status !== 'canceled' && (
          <View style={{ padding: spacing.md, gap: spacing.sm }}>
            <Button variant="outline" onPress={handleCancel}>
              <Ionicons name="close-circle-outline" size={20} color={colors.danger} /> Cancel Registration
            </Button>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showChevron?: boolean;
}

function InfoRow({ icon, label, value, showChevron }: InfoRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
      <Ionicons name={icon} size={20} color={colors.muted} style={{ marginRight: spacing.sm }} />
      <View style={{ flex: 1 }}>
        <Caption color="gray">{label}</Caption>
        <BodyText>{value}</BodyText>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color={colors.muted} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  qrCodeContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
