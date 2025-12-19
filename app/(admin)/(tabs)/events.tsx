// app/(admin)/(tabs)/events.tsx
/**
 * Premium Events List
 * Enhanced with better data display and reduced padding
 */

import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { Loading } from '@/components/ui/Loading';
import { SearchBar } from '@/components/ui/SearchBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BodyText, Heading1, Typography } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { Event } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Sport', value: 'sport' },
  { label: 'Culture', value: 'culture' },
  { label: 'Game', value: 'game' },
  { label: 'Workshop', value: 'workshop' },
];

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Finished', value: 'finished' },
];

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadEvents = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (!isRefresh && pageNum === 1) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const response = await adminApi.getEvents({
        page: pageNum,
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
      });

      if (response.success && response.data) {
        const newEvents = response.data;
        
        if (pageNum === 1) {
          setEvents(newEvents);
        } else {
          setEvents(prev => [...prev, ...newEvents]);
        }

        setHasMore(
          response.meta?.current_page != null && 
          response.meta?.last_page != null && 
          response.meta.current_page < response.meta.last_page
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      loadEvents(1);
    }, [searchQuery, selectedCategory, selectedStatus])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents(1, true);
  }, [loadEvents]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadEvents(page + 1);
    }
  }, [loadingMore, hasMore, page, loadEvents]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setPage(1);
  }, []);

  const handleDeleteEvent = useCallback(async (event: Event) => {
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
              loadEvents(1);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete event');
            }
          },
        },
      ]
    );
  }, [loadEvents]);

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || price === 0) return 'Free';
    return `${price.toLocaleString()} DZD`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const sameDay = start.toDateString() === end.toDateString();
    
    if (sameDay) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const registeredCount = item.registeredCount ?? 0;
    const capacity = item.capacity ?? 1;
    const capacityPercent = capacity > 0 ? Math.min((registeredCount / capacity) * 100, 100) : 0;
    
    return (
      <TouchableOpacity
        className="mb-4"
        onPress={() => router.push(`/(admin)/events/${item.id}`)}
        activeOpacity={0.9}
      >
        <Card variant="elevated" className="overflow-hidden">
          {/* Event Image - Reduced height */}
          <View className="relative h-44">
            {item.imageUrl ? (
              <Image
                source={{ uri: getImageUrl(item.imageUrl) || undefined }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#4F46E5', '#6366f1', '#818cf8']}
                className="w-full h-full justify-center items-center"
              >
                <MaterialIcons name="event" size={48} color="rgba(255,255,255,0.25)" />
              </LinearGradient>
            )}
            
            {/* Dark Gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              className="absolute bottom-0 left-0 right-0 h-24"
            />
            
            {/* Status Badge - Compact */}
            <View className="absolute top-3 right-3">
              <StatusBadge status={item.status as any} />
            </View>

            {/* Category Badge */}
            <View className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-lg">
              <Text className="text-xs font-bold text-gray-800 uppercase">{item.category}</Text>
            </View>

            {/* Title Overlay */}
            <View className="absolute bottom-0 left-0 right-0 p-4">
              <Text className="text-lg font-bold text-white" numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          </View>

          {/* Info Section - Compact */}
          <View className="p-4">
            {/* Date & Location Row */}
            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center flex-1">
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text className="text-xs text-gray-600 font-medium ml-1.5" numberOfLines={1}>
                  {formatDateRange(item.startDate, item.endDate)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text className="text-xs text-gray-600 font-medium ml-1">{item.province}</Text>
              </View>
            </View>

            {/* Price & Capacity Row */}
            <View className="flex-row items-center justify-between mb-3">
              {/* Price */}
              <View className="flex-row items-center">
                <View className={`px-2.5 py-1 rounded-lg ${item.basePrice === 0 ? 'bg-success-100' : 'bg-primary-100'}`}>
                  <Text className={`text-sm font-bold ${item.basePrice === 0 ? 'text-success-700' : 'text-primary-700'}`}>
                    {formatPrice(item.basePrice)}
                  </Text>
                </View>
              </View>

              {/* Game Type Badge */}
              {item.eventType === 'game' && item.gameType && (
                <View className="flex-row items-center bg-warning-100 px-2 py-1 rounded-lg">
                  <Ionicons name="game-controller-outline" size={12} color="#d97706" />
                  <Text className="text-xs font-bold text-warning-700 ml-1">{item.gameType}</Text>
                </View>
              )}
            </View>

            {/* Capacity - Only show if data available */}
            {(item.registeredCount != null && item.capacity != null && item.capacity > 0) ? (
              <View className="mb-3">
                <View className="flex-row justify-between items-center mb-1">
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={14} color="#6b7280" />
                    <Text className="text-xs text-gray-600 ml-1.5">{registeredCount}/{capacity}</Text>
                  </View>
                  <Text className="text-xs font-bold text-gray-700">{Math.round(capacityPercent)}%</Text>
                </View>
                <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${capacityPercent}%`,
                      backgroundColor: capacityPercent >= 90 ? '#ef4444' : capacityPercent >= 70 ? '#f59e0b' : '#4F46E5'
                    }}
                  />
                </View>
              </View>
            ) : (
              <View className="flex-row items-center mb-3">
                <View className="bg-gray-100 px-2 py-1 rounded-lg flex-row items-center">
                  <Ionicons name="information-circle-outline" size={12} color="#6b7280" />
                  <Text className="text-xs text-gray-500 ml-1">View for details</Text>
                </View>
              </View>
            )}

            {/* Action Buttons - Compact */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-primary-600 rounded-xl py-2.5 flex-row items-center justify-center"
                onPress={() => router.push(`/(admin)/events/${item.id}`)}
                activeOpacity={0.85}
              >
                <Ionicons name="eye-outline" size={16} color="#ffffff" />
                <Text className="text-sm font-bold text-white ml-1.5">View</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-2.5 flex-row items-center justify-center border border-gray-200"
                onPress={() => router.push(`/(admin)/events/${item.id}/edit` as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="create-outline" size={16} color="#4b5563" />
                <Text className="text-sm font-bold text-gray-700 ml-1.5">Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="w-10 bg-error-50 rounded-xl py-2.5 items-center justify-center border border-error-200"
                onPress={() => handleDeleteEvent(item)}
                activeOpacity={0.85}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className="mb-4">
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onSearch={handleSearch}
        onClear={() => handleSearch('')}
        placeholder="Search events..."
        variant="elevated"
        showFilter
        onFilterPress={() => setShowFilters(!showFilters)}
        containerClassName="mb-3"
      />

      {/* Action Bar */}
      <View className="flex-row mb-3 gap-2">
        <TouchableOpacity
          className="w-12 h-12 rounded-xl justify-center items-center shadow-lg bg-primary-600"
          onPress={() => router.push('/(admin)/events/create')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <Card variant="elevated" className="p-4 mb-3">
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Category</Text>
          <View className="flex-row flex-wrap mb-4">
            {CATEGORY_FILTERS.map(filter => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                selected={selectedCategory === filter.value}
                onPress={() => setSelectedCategory(filter.value)}
                className="mr-2 mb-2"
              />
            ))}
          </View>

          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Status</Text>
          <View className="flex-row flex-wrap">
            {STATUS_FILTERS.map(filter => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                selected={selectedStatus === filter.value}
                onPress={() => setSelectedStatus(filter.value)}
                className="mr-2 mb-2"
              />
            ))}
          </View>
        </Card>
      )}

      {/* Results Count */}
      <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {events?.length || 0} events found
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading fullScreen text="Loading events..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header - Reduced padding */}
      <View className="px-5 pt-5 pb-3">
        <Heading1 className="tracking-tight mb-1">
          Events
        </Heading1>
        <BodyText color="gray" weight="medium">
          Manage your event portfolio
        </BodyText>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-6 items-center">
              <Loading size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Card variant="elevated" className="p-10 items-center">
              <MaterialIcons name="event-busy" size={64} color="#d1d5db" />
              <Typography variant="h5" weight="bold" className="mt-4 mb-2">No events found</Typography>
              <BodyText color="gray" weight="medium" align="center" className="mb-6">
                Start creating amazing events for your community
              </BodyText>
              <TouchableOpacity
                className="rounded-xl px-6 py-3 shadow-lg bg-primary-600"
                onPress={() => router.push('/(admin)/events/create')}
                activeOpacity={0.85}
              >
                <Text className="text-base font-bold text-white">Create First Event</Text>
              </TouchableOpacity>
            </Card>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}