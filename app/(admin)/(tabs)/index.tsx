// app/(admin)/(tabs)/index.tsx
/**
 * Ultra-Premium Dashboard
 * Enhanced with better spacing, color usage, and component improvements
 */

import { EventCard } from '@/components/cards/EventCard';
import { RegistrationCard } from '@/components/cards/RegistrationCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminApi } from '@/services/api/admin-api';
import { AdminStats, Event, Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
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
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-600 mt-4 text-lg font-semibold">Loading dashboard...</Text>
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
          <Text className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Dashboard
          </Text>
          <Text className="text-lg text-gray-600 font-semibold">
            Welcome back! Here's your overview
          </Text>
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
                <Text className="text-6xl font-black text-white mb-2">
                  {stats?.events.total || 0}
                </Text>
                <Text className="text-base font-bold text-white/95 tracking-wide">
                  TOTAL EVENTS
                </Text>
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
                <Text className="text-6xl font-black text-white mb-2">
                  {stats?.users.active || 0}
                </Text>
                <Text className="text-base font-bold text-white/95 tracking-wide">
                  ACTIVE USERS
                </Text>
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
                <Text className="text-6xl font-black text-white mb-2">
                  {stats?.registrations.total || 0}
                </Text>
                <Text className="text-base font-bold text-white/95 tracking-wide">
                  REGISTRATIONS
                </Text>
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
                <Text className="text-6xl font-black text-white mb-2">
                  ${((stats?.registrations.total || 0) * 12.5).toFixed(0)}
                </Text>
                <Text className="text-base font-bold text-white/95 tracking-wide">
                  REVENUE (EST.)
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Enhanced Mini Stats Bar */}
        <View className="px-8 pb-8">
          <Card variant="elevated" className="p-6">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-3xl font-black text-primary-700 mb-1">
                  {stats?.events.published || 0}
                </Text>
                <Text className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                  Published
                </Text>
              </View>
              <View className="w-px h-12 bg-gray-200" />
              <View className="items-center">
                <Text className="text-3xl font-black text-warning-700 mb-1">
                  {stats?.events.ongoing || 0}
                </Text>
                <Text className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                  Ongoing
                </Text>
              </View>
              <View className="w-px h-12 bg-gray-200" />
              <View className="items-center">
                <Text className="text-3xl font-black text-success-700 mb-1">
                  {stats?.registrations.confirmed || 0}
                </Text>
                <Text className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                  Confirmed
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Enhanced Quick Actions */}
        <View className="px-8 pb-8">
          <Text className="text-2xl font-extrabold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row gap-4">
            <Button
              variant="primary"
              size="lg"
              gradient
              onPress={() => router.push('/(admin)/events/create' as any)}
              className="flex-1"
              leftIcon={<Ionicons name="add-circle" size={24} color="#ffffff" />}
            >
              <Text className="font-bold">New Event</Text>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              gradient
              onPress={() => router.push('/(admin)/scan')}
              className="flex-1"
              leftIcon={<Ionicons name="qr-code" size={24} color="#ffffff" />}
            >
              <Text className="font-bold">Scan QR</Text>
            </Button>
          </View>
        </View>

        {/* Recent Events */}
        <View className="px-8 pb-8">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-extrabold text-gray-900">Recent Events</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/events')}>
              <Text className="text-base font-bold text-primary-600">View All →</Text>
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
              <Text className="text-gray-500 mt-3 font-semibold">No recent events</Text>
            </Card>
          )}
        </View>

        {/* Recent Registrations */}
        <View className="px-8 pb-10">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-extrabold text-gray-900">Recent Registrations</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/registrations')}>
              <Text className="text-base font-bold text-primary-600">View All →</Text>
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
              <Text className="text-gray-500 mt-3 font-semibold">No recent registrations</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
