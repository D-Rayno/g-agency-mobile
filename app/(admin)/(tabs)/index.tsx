// app/(admin)/(tabs)/index.tsx
import { EventCard } from '@/components/cards/EventCard';
import { RegistrationCard } from '@/components/cards/RegistrationCard';
import { UserCard } from '@/components/cards/UserCard';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { BodyText, Caption, Heading2, Heading3 } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { AdminStats, Event, Registration, User } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View
} from 'react-native';

export default function DashboardScreen() {
  const { colors, spacing } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    events: AdminStats['events'];
    users: AdminStats['users'];
    registrations: AdminStats['registrations'];
  } | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchDashboardData = async () => {
    try {
      const [eventStats, userStats, registrationStats, eventsResponse, usersResponse, registrationsResponse] = await Promise.all([
        adminApi.getEventStats(),
        adminApi.getUserStats(),
        adminApi.getRegistrationStats(),
        adminApi.getEvents({ page: 1 }),
        adminApi.getUsers({ page: 1, limit: 5 }),
        adminApi.getRegistrations({ page: 1, limit: 10 }),
      ]);

      setStats({
        events: eventStats.data!,
        users: userStats.data!,
        registrations: registrationStats.data!,
      });

      setRecentEvents(eventsResponse.data?.slice(0, 5) || []);
      setRecentUsers(usersResponse.data?.slice(0, 5) || []);
      setRecentRegistrations(registrationsResponse.data?.slice(0, 10) || []);

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const toggleEventExpand = (eventId: number) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'attended': return colors.primary;
      case 'canceled': return colors.danger;
      case 'pending': return colors.warning;
      default: return colors.muted;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'published': return colors.primary;
      case 'ongoing': return colors.warning;
      case 'finished': return colors.success;
      case 'draft': return colors.muted;
      case 'cancelled': return colors.danger;
      default: return colors.muted;
    }
  };

  if (loading && !refreshing) {
    return (
      <Container className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <Container safe>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Heading2>Dashboard</Heading2>
            <Caption color="gray">Overview of your agency</Caption>
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
            <StatCard
              title="Total Events"
              value={stats?.events.total || 0}
              icon="calendar"
              color={colors.primary}
              onPress={() => router.push('/(admin)/(tabs)/events')}
              containerStyle={{ marginRight: spacing.sm }}
            />
            <StatCard
              title="Active Users"
              value={stats?.users.active || 0}
              icon="people"
              color={colors.secondary}
              onPress={() => router.push('/(admin)/(tabs)/users')}
              containerStyle={{ marginRight: spacing.sm }}
            />
            <StatCard
              title="Registrations"
              value={stats?.registrations.total || 0}
              icon="ticket"
              color={colors.success}
              onPress={() => router.push('/(admin)/(tabs)/registrations')}
            />
          </View>

          {/* Quick Stats Row */}
          <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
            <MiniStatCard
              label="Published"
              value={stats?.events.published || 0}
              color={colors.primary}
              containerStyle={{ marginRight: spacing.sm }}
            />
            <MiniStatCard
              label="Ongoing"
              value={stats?.events.ongoing || 0}
              color={colors.warning}
              containerStyle={{ marginRight: spacing.sm }}
            />
            <MiniStatCard
              label="Confirmed"
              value={stats?.registrations.confirmed || 0}
              color={colors.success}
            />
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: spacing.lg }}>
            <Heading3 className="mb-3">Quick Actions</Heading3>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <QuickAction
                title="New Event"
                icon="add-circle-outline"
                onPress={() => router.push('/(admin)/events/create' as any)}
              />
              <QuickAction
                title="Scan QR"
                icon="qr-code-outline"
                onPress={() => router.push('/(admin)/scan')}
              />
            </View>
          </View>

          {/* Recent Events with Registrations */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Heading3>Recent Events</Heading3>
              <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/events')}>
                <Caption color="primary" weight="semibold">View All</Caption>
              </TouchableOpacity>
            </View>

            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => router.push(`/(admin)/events/${event.id}` as any)}
                  showRegistrations={(event.registeredCount || 0) > 0}
                  onExpandRegistrations={() => toggleEventExpand(event.id)}
                  isExpanded={expandedEventId === event.id}
                  registrationsPreview={
                    <>
                      <Caption color="gray" className="mb-2">Recent registrations for this event:</Caption>
                      {recentRegistrations
                        .filter(reg => reg.eventId === event.id)
                        .slice(0, 3)
                        .map((reg) => (
                          <RegistrationCard
                            key={reg.id}
                            registration={reg}
                            showEvent={false}
                            compact
                          />
                        ))}
                      {recentRegistrations.filter(reg => reg.eventId === event.id).length === 0 && (
                        <Caption color="gray" style={{ fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 }}>
                          No registrations loaded yet
                        </Caption>
                      )}
                    </>
                  }
                />
              ))
            ) : (
              <Card>
                <View className="py-8 items-center justify-center">
                  <Ionicons name="calendar-outline" size={48} color={colors.muted} />
                  <Caption color="gray" className="mt-2">No recent events</Caption>
                </View>
              </Card>
            )}
          </View>

          {/* Recent Users */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Heading3>Recent Users</Heading3>
              <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/users')}>
                <Caption color="primary" weight="semibold">View All</Caption>
              </TouchableOpacity>
            </View>

            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onPress={() => router.push(`/(admin)/users/${user.id}` as any)}
                  showDetails={false}
                />
              ))
            ) : (
              <Card>
                <View className="py-8 items-center justify-center">
                  <Ionicons name="people-outline" size={48} color={colors.muted} />
                  <Caption color="gray" className="mt-2">No recent users</Caption>
                </View>
              </Card>
            )}
          </View>

          {/* Recent Registrations */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Heading3>Recent Registrations</Heading3>
              <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/registrations')}>
                <Caption color="primary" weight="semibold">View All</Caption>
              </TouchableOpacity>
            </View>

            {recentRegistrations.length > 0 ? (
              recentRegistrations.slice(0, 5).map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                  onPress={() => router.push(`/(admin)/registrations/${registration.id}` as any)}
                />
              ))
            ) : (
              <Card>
                <View className="py-8 items-center justify-center">
                  <Ionicons name="ticket-outline" size={48} color={colors.muted} />
                  <Caption color="gray" className="mt-2">No recent registrations</Caption>
                </View>
              </Card>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
  containerStyle?: any;
}

function StatCard({ title, value, icon, color, onPress, containerStyle }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={[{ flex: 1 }, containerStyle]} activeOpacity={0.7}>
      <Card className="items-center justify-center p-4">
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8
        }}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Heading3 style={{ fontSize: 24 }}>{value}</Heading3>
        <Caption color="gray" align="center">{title}</Caption>
      </Card>
    </TouchableOpacity>
  );
}

interface MiniStatCardProps {
  label: string;
  value: number;
  color: string;
  containerStyle?: any;
}

function MiniStatCard({ label, value, color, containerStyle }: MiniStatCardProps) {
  return (
    <View style={[{ 
      flex: 1, 
      backgroundColor: color + '10', 
      padding: 12, 
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: color 
    }, containerStyle]}>
      <Caption color="gray">{label}</Caption>
      <Heading3 style={{ color, marginTop: 4 }}>{value}</Heading3>
    </View>
  );
}

interface QuickActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

function QuickAction({ title, icon, onPress }: QuickActionProps) {
  const { colors, spacing } = useTheme();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={{ width: '48%', marginBottom: spacing.sm }}
      activeOpacity={0.7}
    >
      <Card className="p-4 flex-row items-center">
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary + '10',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <BodyText weight="medium">{title}</BodyText>
      </Card>
    </TouchableOpacity>
  );
}
