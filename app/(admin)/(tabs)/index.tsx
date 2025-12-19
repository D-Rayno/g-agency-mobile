// app/(admin)/(tabs)/index.tsx
/**
 * Ultra-Premium Dashboard
 * Enhanced with better spacing, color usage, and component improvements
 */

import { EventCard } from '@/components/cards/EventCard';
import { RegistrationCard } from '@/components/cards/RegistrationCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Caption, Heading1, Heading3, Overline, Typography } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { AdminStats, Event, Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    events: AdminStats['events'];
    users: AdminStats['users'];
    registrations: AdminStats['registrations'];
  } | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [eventStats, userStats, registrationStats, eventsResponse, registrationsResponse] = await Promise.all([
        adminApi.getEventStats(),
        adminApi.getUserStats(),
        adminApi.getRegistrationStats(),
        adminApi.getEvents({ page: 1 }),
        adminApi.getRegistrations({ page: 1, limit: 10 }),
      ]);

      setStats({
        events: eventStats.data!,
        users: userStats.data!,
        registrations: registrationStats.data!,
      });

      setRecentEvents(eventsResponse.data?.slice(0, 3) || []);
      setRecentRegistrations(registrationsResponse.data?.slice(0, 5) || []);
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

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading fullScreen text="Loading dashboard..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Premium Header */}
        <View className="px-8 pt-8 pb-6">
          <Heading1 className="tracking-tighter mb-2">
            Dashboard
          </Heading1>
          <BodyText color="gray" weight="semibold">
            Welcome back! Here's your overview
          </BodyText>
        </View>

        {/* Enhanced KPI Cards Grid */}
        <View className="px-8 pb-6">
          <View className="flex-row gap-4 mb-4">
            {/* Total Events - Enhanced */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/(tabs)/events')}
              className="flex-1"
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4F46E5', '#6366f1', '#818cf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[24px] p-6 shadow-2xl"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-14 h-14 rounded-2xl bg-white/25 items-center justify-center border-2 border-white/30">
                    <Ionicons name="calendar" size={28} color="#ffffff" />
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.7)" />
                </View>
                <Typography variant="h1" weight="black" color="white" className="mb-2" numberOfLines={1} adjustsFontSizeToFit>
                  {stats?.events.total || 0}
                </Typography>
                <Overline color="white" className="opacity-95">
                  TOTAL EVENTS
                </Overline>
              </LinearGradient>
            </TouchableOpacity>

            {/* Active Users - Enhanced */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/(tabs)/users')}
              className="flex-1"
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#14B8A6', '#0d9488', '#0f766e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[24px] p-6 shadow-2xl"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-14 h-14 rounded-2xl bg-white/25 items-center justify-center border-2 border-white/30">
                    <Ionicons name="people" size={28} color="#ffffff" />
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.7)" />
                </View>
                <Typography variant="h1" weight="black" color="white" className="mb-2" numberOfLines={1} adjustsFontSizeToFit>
                  {stats?.users.active || 0}
                </Typography>
                <Overline color="white" className="opacity-95">
                  ACTIVE USERS
                </Overline>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4">
            {/* Registrations - Enhanced */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/(tabs)/registrations')}
              className="flex-1"
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a', '#15803d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[24px] p-6 shadow-2xl"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-14 h-14 rounded-2xl bg-white/25 items-center justify-center border-2 border-white/30">
                    <Ionicons name="ticket" size={28} color="#ffffff" />
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.7)" />
                </View>
                <Typography variant="h1" weight="black" color="white" className="mb-2" numberOfLines={1} adjustsFontSizeToFit>
                  {stats?.registrations.total || 0}
                </Typography>
                <Overline color="white" className="opacity-95">
                  REGISTRATIONS
                </Overline>
              </LinearGradient>
            </TouchableOpacity>

            {/* Revenue - Enhanced */}
            <View className="flex-1">
              <LinearGradient
                colors={['#f59e0b', '#d97706', '#b45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[24px] p-6 shadow-2xl"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-14 h-14 rounded-2xl bg-white/25 items-center justify-center border-2 border-white/30">
                    <Ionicons name="cash" size={28} color="#ffffff" />
                  </View>
                </View>
                <Typography variant="h2" weight="black" color="white" className="mb-2" numberOfLines={1} adjustsFontSizeToFit>
                  {((stats?.registrations.total || 0) * 12.5).toLocaleString()}
                </Typography>
                <Overline color="white" className="opacity-95">
                  REVENUE (DZD)
                </Overline>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Enhanced Mini Stats Bar */}
        <View className="px-8 pb-8">
          <Card variant="elevated" className="p-6">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Heading3 className="text-primary-700 mb-1">
                  {stats?.events.published || 0}
                </Heading3>
                <Caption weight="bold" className="uppercase tracking-wider">
                  Published
                </Caption>
              </View>
              <View className="w-px h-12 bg-gray-200" />
              <View className="items-center">
                <Heading3 className="text-warning-700 mb-1">
                  {stats?.events.ongoing || 0}
                </Heading3>
                <Caption weight="bold" className="uppercase tracking-wider">
                  Ongoing
                </Caption>
              </View>
              <View className="w-px h-12 bg-gray-200" />
              <View className="items-center">
                <Heading3 className="text-success-700 mb-1">
                  {stats?.registrations.confirmed || 0}
                </Heading3>
                <Caption weight="bold" className="uppercase tracking-wider">
                  Confirmed
                </Caption>
              </View>
            </View>
          </Card>
        </View>

        {/* Enhanced Quick Actions */}
        <View className="px-8 pb-8">
          <Heading3 className="mb-4">Quick Actions</Heading3>
          <View className="flex-row gap-4">
            <Button
              variant="primary"
              size="lg"
              gradient
              onPress={() => router.push('/(admin)/events/create' as any)}
              className="flex-1"
              leftIcon={<Ionicons name="add-circle" size={24} color="#ffffff" />}
            >
              New Event
            </Button>

            <Button
              variant="secondary"
              size="lg"
              gradient
              onPress={() => router.push('/(admin)/scan')}
              className="flex-1"
              leftIcon={<Ionicons name="qr-code" size={24} color="#ffffff" />}
            >
              Scan QR
            </Button>
          </View>
        </View>

        {/* Recent Events */}
        <View className="px-8 pb-8">
          <View className="flex-row justify-between items-center mb-5">
            <Heading3>Recent Events</Heading3>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/events')}>
              <BodyText weight="bold" color="primary">View All →</BodyText>
            </TouchableOpacity>
          </View>

          {recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/(admin)/events/${event.id}` as any)}
              />
            ))
          ) : (
            <Card variant="elevated" className="p-10 items-center">
              <Ionicons name="calendar-outline" size={56} color="#d1d5db" />
              <BodyText color="gray" weight="semibold" className="mt-3">No recent events</BodyText>
            </Card>
          )}
        </View>

        {/* Recent Registrations */}
        <View className="px-8 pb-10">
          <View className="flex-row justify-between items-center mb-5">
            <Heading3>Recent Registrations</Heading3>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/registrations')}>
              <BodyText weight="bold" color="primary">View All →</BodyText>
            </TouchableOpacity>
          </View>

          {recentRegistrations.length > 0 ? (
            recentRegistrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onPress={() => router.push(`/(admin)/registrations/${registration.id}` as any)}
              />
            ))
          ) : (
            <Card variant="elevated" className="p-10 items-center">
              <Ionicons name="ticket-outline" size={56} color="#d1d5db" />
              <BodyText color="gray" weight="semibold" className="mt-3">No recent registrations</BodyText>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
