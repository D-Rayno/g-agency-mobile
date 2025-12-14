// app/(admin)/(tabs)/registrations.tsx
/**
 * Ultra-Premium Registrations List
 * Enhanced with better spacing and visual hierarchy
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminApi } from '@/services/api/admin-api';
import { Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegistrationsScreen() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadRegistrations = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (!isRefresh && pageNum === 1) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const response = await adminApi.getRegistrations({
        page: pageNum,
      });

      if (response.success && response.data) {
        const newRegistrations = response.data;
        if (pageNum === 1) {
          setRegistrations(newRegistrations);
        } else {
          setRegistrations(prev => [...prev, ...newRegistrations]);
        }
        setHasMore(
          response.meta?.current_page != null && 
          response.meta?.last_page != null && 
          response.meta.current_page < response.meta.last_page
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load registrations:', error);
      Alert.alert('Error', 'Failed to load registrations');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  React.useEffect(() => {
    loadRegistrations(1);
  }, [loadRegistrations]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRegistrations(1, true);
  }, [loadRegistrations]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadRegistrations(page + 1);
    }
  }, [loadingMore, hasMore, page, loadRegistrations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22c55e';
      case 'attended': return '#4F46E5';
      case 'cancelled': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'confirmed': return '#D1FAE5';
      case 'attended': return '#EEF2FF';
      case 'cancelled': return '#FEE2E2';
      case 'pending': return '#FEF3C7';
      default: return '#F3F4F6';
    }
  };

  const renderRegistrationCard = ({ item }: { item: Registration }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/(admin)/registrations/${item.id}`)}
      className="mb-4"
      activeOpacity={0.85}
    >
      <Card variant="elevated" className="p-6">
        <View className="flex-row justify-between items-start mb-5">
          <View className="flex-1 mr-4">
            <Text className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              EVENT
            </Text>
            <Text className="text-xl font-black text-gray-900" numberOfLines={1}>
              {item.event?.name || 'Unknown Event'}
            </Text>
          </View>
          
          {/* Enhanced Status Badge */}
          <View 
            className="px-5 py-3 rounded-2xl border-2"
            style={{ 
              backgroundColor: getStatusBg(item.status),
              borderColor: getStatusColor(item.status)
            }}
          >
            <Text 
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: getStatusColor(item.status) }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            ATTENDEE
          </Text>
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-primary-100 items-center justify-center mr-4 border-2 border-primary-200">
              <Text className="text-primary-700 font-black text-xl">
                {item.user?.firstName?.[0]}{item.user?.lastName?.[0]}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-gray-900">
                {item.user?.firstName} {item.user?.lastName}
              </Text>
              <Text className="text-base text-gray-600 font-medium mt-0.5">
                {item.user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center pt-4 border-t-2 border-gray-100">
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2.5 font-semibold">
            Registered {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-600 mt-4 text-lg font-semibold">Loading registrations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <View className="px-8 pt-8 pb-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Registrations
          </Text>
          <Text className="text-lg text-gray-600 font-semibold">
            Track event attendees
          </Text>
        </View>
        <Button 
          size="md" 
          variant="primary"
          gradient
          leftIcon={<Ionicons name="qr-code" size={20} color="white" />}
          onPress={() => router.push('/(admin)/scan')}
        >
          Scan
        </Button>
      </View>

      <FlatList
        data={registrations}
        renderItem={renderRegistrationCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 12, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#4F46E5" className="py-8" /> : null}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Card variant="elevated" className="p-16 items-center">
              <Ionicons name="ticket-outline" size={88} color="#d1d5db" />
              <Text className="text-2xl font-black text-gray-900 mt-6">No registrations yet</Text>
              <Text className="text-base text-gray-500 mt-3 text-center font-medium">
                Registrations will appear here as users sign up
              </Text>
            </Card>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
