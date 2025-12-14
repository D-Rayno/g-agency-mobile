// app/(admin)/events/[id].tsx
import { RegistrationCard } from '@/components/cards';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Caption, Heading2, Heading3 } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { Event, Registration } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadEvent = async (isRefresh = false) => {
    if (!id) return;

    try {
      if (!isRefresh) setLoading(true);

      const [eventResponse, registrationsResponse] = await Promise.all([
        adminApi.getEvent(Number(id)),
        adminApi.getRegistrations({ event_id: Number(id), limit: 100 })
      ]);
      
      if (eventResponse.success && eventResponse.data) {
        setEvent(eventResponse.data);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }

      if (registrationsResponse.success && registrationsResponse.data) {
        setRegistrations(registrationsResponse.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load event details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvent(true);
  };

  const handleDelete = () => {
    if (!event) return;

    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteEvent(event.id);
              Alert.alert('Success', 'Event deleted successfully');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return colors.muted;
      case 'published': return colors.primary;
      case 'ongoing': return colors.warning;
      case 'finished': return colors.success;
      case 'cancelled': return colors.danger;
      default: return colors.muted;
    }
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Loading />
      </SafeAreaView>
    );
  }

  const registrationProgress = Math.min((event.registeredCount / event.capacity) * 100, 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <BodyText weight="semibold" numberOfLines={1}>Event Details</BodyText>
        </View>
        <TouchableOpacity 
          onPress={() => router.push(`/(admin)/events/${event.id}/edit` as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Event Image */}
          <View style={styles.imageContainer}>
            {event.imageUrl ? (
              <Image
                source={{ uri: getImageUrl(event.imageUrl) || undefined }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                <MaterialIcons name="event" size={64} color={colors.muted} />
              </View>
            )}
            
            {/* Gradient Overlay */}
            <View style={styles.imageGradient} />
            
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
              <Caption style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>
                {event.status.toUpperCase()}
              </Caption>
            </View>
            
            {/* Featured Badge */}
            {event.isFeatured && (
              <View style={[styles.featuredBadge, { backgroundColor: colors.warning }]}>
                <Ionicons name="star" size={14} color="#fff" />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={{ padding: spacing.md }}>
            {/* Event Name */}
            <Heading2 className="mb-2">{event.name}</Heading2>
            <Caption color="gray" className="mb-4">{event.category}</Caption>

            {/* Quick Stats */}
            <View style={[styles.quickStats, { marginBottom: spacing.lg }]}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <View>
                  <Caption color="gray">Registered</Caption>
                  <BodyText weight="semibold">{event.registeredCount || 0}/{event.capacity}</BodyText>
                </View>
              </View>
              
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              
              <View style={styles.statItem}>
                <Ionicons name="calendar" size={20} color={colors.secondary} style={{ marginRight: 8 }} />
                <View>
                  <Caption color="gray">Starts</Caption>
                  <BodyText weight="semibold">{new Date(event.startDate).toLocaleDateString()}</BodyText>
                </View>
              </View>
            </View>

            {/* Registration Progress */}
            <Card className="mb-4 p-4">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Caption>Registration Progress</Caption>
                <Caption weight="semibold">{Math.round(registrationProgress)}%</Caption>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${registrationProgress}%`,
                      backgroundColor: registrationProgress >= 100 ? colors.danger : colors.primary,
                    },
                  ]}
                />
              </View>
              <Caption color="gray" className="mt-2">
                {event.availableSeats > 0 
                  ? `${event.availableSeats} seats available`
                  : 'Event is full'}
              </Caption>
            </Card>

            {/* Basic Info */}
            <Card className="mb-4 p-4">
              <Heading3 className="mb-3">Event Information</Heading3>
              <InfoRow icon="calendar-outline" label="Start Date" value={new Date(event.startDate).toLocaleString()} />
              <InfoRow icon="calendar-outline" label="End Date" value={new Date(event.endDate).toLocaleString()} />
              <InfoRow icon="location-outline" label="Location" value={event.location} />
              <InfoRow icon="location-outline" label="Province/Commune" value={`${event.province} / ${event.commune}`} />
            </Card>

            {/* Pricing */}
            <Card className="mb-4 p-4">
              <Heading3 className="mb-3">Pricing</Heading3>
              <InfoRow icon="cash-outline" label="Base Price" value={`${event.basePrice} DA`} />
              {event.youthPrice && <InfoRow icon="person-outline" label="Youth Price (<26)" value={`${event.youthPrice} DA`} />}
              {event.seniorPrice && <InfoRow icon="person-outline" label="Senior Price (≥60)" value={`${event.seniorPrice} DA`} />}
              <InfoRow icon="people-outline" label="Age Range" value={`${event.minAge}${event.maxAge ? ` - ${event.maxAge}` : '+'} years`} />
            </Card>

            {/* Description */}
            {event.description && (
              <Card className="mb-4 p-4">
                <Heading3 className="mb-3">Description</Heading3>
                <BodyText>{event.description}</BodyText>
              </Card>
            )}

            {/* Game Details */}
            {event.eventType === 'game' && (
              <Card className="mb-4 p-4">
                <Heading3 className="mb-3">Game Details</Heading3>
                {event.gameType && <InfoRow icon="game-controller-outline" label="Game Type" value={event.gameType} />}
                {event.difficulty && <InfoRow icon="barbell-outline" label="Difficulty" value={event.difficulty.toUpperCase()} />}
                {event.durationMinutes && <InfoRow icon="time-outline" label="Duration" value={`${event.durationMinutes} minutes`} />}
                {event.physicalIntensity && <InfoRow icon="fitness-outline" label="Physical Intensity" value={event.physicalIntensity.toUpperCase()} />}
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
                <Heading3 className="mb-3">Tags</Heading3>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {event.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      size="sm"
                      style={{ marginRight: 8, marginBottom: 8 }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </View>
              </Card>
            )}

            {/* Registrations Section */}
            <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                <Heading3>Registrations ({registrations.length})</Heading3>
                <TouchableOpacity 
                  onPress={() => router.push(`/(admin)/(tabs)/registrations` as any)}
                  activeOpacity={0.7}
                >
                  <Caption color="primary" weight="semibold">View All</Caption>
                </TouchableOpacity>
              </View>

              {/* Registration Stats */}
              <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <View style={{ 
                    backgroundColor: colors.success + '15', 
                    padding: spacing.sm, 
                    borderRadius: radius.md,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.success
                  }}>
                    <Caption color="gray" style={{ fontSize: 10 }}>Confirmed</Caption>
                    <BodyText weight="bold" style={{ color: colors.success, marginTop: 2 }}>
                      {registrations.filter(r => r.status === 'confirmed').length}
                    </BodyText>
                  </View>
                </View>
                
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <View style={{ 
                    backgroundColor: colors.primary + '15', 
                    padding: spacing.sm, 
                    borderRadius: radius.md,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary
                  }}>
                    <Caption color="gray" style={{ fontSize: 10 }}>Attended</Caption>
                    <BodyText weight="bold" style={{ color: colors.primary, marginTop: 2 }}>
                      {registrations.filter(r => r.status === 'attended').length}
                    </BodyText>
                  </View>
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{ 
                    backgroundColor: colors.warning + '15', 
                    padding: spacing.sm, 
                    borderRadius: radius.md,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.warning
                  }}>
                    <Caption color="gray" style={{ fontSize: 10 }}>Pending</Caption>
                    <BodyText weight="bold" style={{ color: colors.warning, marginTop: 2 }}>
                      {registrations.filter(r => r.status === 'pending').length}
                    </BodyText>
                  </View>
                </View>
              </View>

              {/* Filter Buttons */}
              <View style={{ flexDirection: 'row', marginBottom: spacing.md, flexWrap: 'wrap' }}>
                {['all', 'confirmed', 'attended', 'pending', 'canceled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilterStatus(status === 'all' ? '' : status)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: radius.md,
                      backgroundColor: filterStatus === (status === 'all' ? '' : status) 
                        ? colors.primary 
                        : colors.border,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                    activeOpacity={0.7}
                  >
                    <Caption 
                      style={{ 
                        color: filterStatus === (status === 'all' ? '' : status) 
                          ? '#fff' 
                          : colors.text,
                        fontWeight: '600',
                        fontSize: 11
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Caption>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Registrations List */}
              {loadingRegistrations ? (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : registrations.filter(r => !filterStatus || r.status === filterStatus).length > 0 ? (
                <View>
                  {registrations
                    .filter(r => !filterStatus || r.status === filterStatus)
                    .slice(0, 5)
                    .map((registration) => (
                      <RegistrationCard
                        key={registration.id}
                        registration={registration}
                        onPress={() => router.push(`/(admin)/registrations/${registration.id}` as any)}
                        showEvent={false}
                      />
                    ))}
                  {registrations.filter(r => !filterStatus || r.status === filterStatus).length > 5 && (
                    <TouchableOpacity
                      onPress={() => router.push(`/(admin)/(tabs)/registrations` as any)}
                      style={{ 
                        paddingVertical: spacing.sm, 
                        alignItems: 'center',
                        backgroundColor: colors.border,
                        borderRadius: radius.md,
                        marginTop: spacing.xs
                      }}
                      activeOpacity={0.7}
                    >
                      <Caption color="primary" weight="semibold">
                        View {registrations.filter(r => !filterStatus || r.status === filterStatus).length - 5} More
                      </Caption>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={48} color={colors.muted} />
                  <Caption color="gray" style={{ marginTop: spacing.sm }}>
                    {filterStatus ? `No ${filterStatus} registrations` : 'No registrations yet'}
                  </Caption>
                </View>
              )}
            </Card>

            {/* Actions */}
            <Button 
              variant="outline" 
              onPress={handleDelete}
              style={{ marginBottom: spacing.md }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
              Delete Event
            </Button>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}

function InfoRow({ icon, label, value, valueColor }: InfoRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm }}>
      <Ionicons name={icon} size={20} color={colors.muted} style={{ marginRight: spacing.sm, marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Caption color="gray">{label}</Caption>
        <BodyText style={{ color: valueColor || colors.text }}>{value}</BodyText>
      </View>
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
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
