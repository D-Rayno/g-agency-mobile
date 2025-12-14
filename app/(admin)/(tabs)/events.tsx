// app/(admin)/(tabs)/events.tsx
/**
 * Ultra-Premium Events List
 * Enhanced with better spacing, colors, and component usage
 */

import { adminApi } from '@/services/api/admin-api';
import { Event } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TextInput,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6B7280';
      case 'published': return '#4F46E5';
      case 'ongoing': return '#f59e0b';
      case 'finished': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'draft': return '#F3F4F6';
      case 'published': return '#EEF2FF';
      case 'ongoing': return '#FEF3C7';
      case 'finished': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      className="mb-5"
      onPress={() => router.push(`/(admin)/events/${item.id}`)}
      activeOpacity={0.9}
    >
      {/* Enhanced Hero Card */}
      <View className="bg-white rounded-[28px] overflow-hidden shadow-2xl border-2 border-gray-50">
        {/* Large Event Image - 70% height */}
        <View className="relative h-80">
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
              <MaterialIcons name="event" size={80} color="rgba(255,255,255,0.25)" />
            </LinearGradient>
          )}
          
          {/* Enhanced Dark Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            className="absolute bottom-0 left-0 right-0 h-40"
          />
          
          {/* Enhanced Status Badge */}
          <View 
            className="absolute top-5 right-5 px-5 py-3 rounded-2xl shadow-xl"
            style={{ backgroundColor: getStatusBgColor(item.status) }}
          >
            <Text 
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: getStatusColor(item.status) }}
            >
              {item.status}
            </Text>
          </View>

          {/* Enhanced Title Overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-7">
            <Text className="text-3xl font-black text-white mb-3 shadow-2xl">
              {item.name}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={18} color="#ffffff" />
              <Text className="text-base font-bold text-white/95 ml-2">
                {new Date(item.startDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <View className="mx-3 w-1.5 h-1.5 rounded-full bg-white/70" />
              <Ionicons name="location" size={18} color="#ffffff" />
              <Text className="text-base font-bold text-white/95 ml-1.5">
                {item.province}
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Info Section */}
        <View className="p-7">
          {/* Stats Row */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View className="bg-primary-50 rounded-2xl px-5 py-3 flex-row items-center border-2 border-primary-100">
                <Ionicons name="people" size={20} color="#4F46E5" />
                <Text className="text-lg font-black text-primary-700 ml-2.5">
                  {item.registeredCount}/{item.capacity}
                </Text>
              </View>
            </View>

            {item.eventType === 'game' && item.gameType && (
              <View className="bg-warning-50 rounded-2xl px-5 py-3 flex-row items-center border-2 border-warning-100">
                <Ionicons name="game-controller" size={18} color="#f59e0b" />
                <Text className="text-sm font-black text-warning-700 ml-2">
                  {item.gameType}
                </Text>
              </View>
            )}
          </View>

          {/* Enhanced Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 flex-row items-center justify-center shadow-xl"
              style={{ backgroundColor: '#4F46E5' }}
              onPress={() => router.push(`/(admin)/events/${item.id}/edit`)}
              activeOpacity={0.85}
            >
              <Ionicons name="create" size={20} color="#ffffff" />
              <Text className="text-base font-black text-white ml-2.5">Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-2xl py-4 flex-row items-center justify-center border-2 border-gray-200"
              onPress={() => handleDeleteEvent(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text className="text-base font-black text-error-600 ml-2.5">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="mb-5">
      {/* Enhanced Search Bar */}
      <View className="bg-white rounded-2xl px-5 mb-4 border-2 border-gray-100 shadow-lg flex-row items-center">
        <Ionicons name="search" size={24} color="#9ca3af" />
        <TextInput
          className="flex-1 py-5 px-4 text-lg text-gray-900 font-medium"
          placeholder="Search events by name..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={24} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Enhanced Action Bar */}
      <View className="flex-row mb-4 gap-3">
        <TouchableOpacity
          className="flex-1 bg-white rounded-2xl py-4 border-2 border-primary-200 flex-row items-center justify-center shadow-md"
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.85}
        >
          <Ionicons name="filter" size={22} color="#4F46E5" />
          <Text className="text-base font-black text-primary-700 ml-2.5">Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-16 h-16 rounded-2xl justify-center items-center shadow-2xl"
          style={{ backgroundColor: '#4F46E5' }}
          onPress={() => router.push('/(admin)/events/create')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <View className="bg-white rounded-[24px] p-6 mb-4 border-2 border-gray-100 shadow-xl">
          <Text className="text-sm font-black text-gray-700 mb-4 uppercase tracking-widest">
            CATEGORY
          </Text>
          <View className="flex-row flex-wrap mb-6">
            {CATEGORY_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.value}
                className={`px-5 py-3 rounded-2xl mr-3 mb-3 ${
                  selectedCategory === filter.value
                    ? 'bg-primary-600 shadow-lg'
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
                onPress={() => setSelectedCategory(filter.value)}
                activeOpacity={0.8}
              >
                <Text className={`text-base font-black ${
                  selectedCategory === filter.value ? 'text-white' : 'text-gray-700'
                }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-black text-gray-700 mb-4 uppercase tracking-widest">
            STATUS
          </Text>
          <View className="flex-row flex-wrap">
            {STATUS_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.value}
                className={`px-5 py-3 rounded-2xl mr-3 mb-3 ${
                  selectedStatus === filter.value
                    ? 'bg-primary-600 shadow-lg'
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
                onPress={() => setSelectedStatus(filter.value)}
                activeOpacity={0.8}
              >
                <Text className={`text-base font-black ${
                  selectedStatus === filter.value ? 'text-white' : 'text-gray-700'
                }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Enhanced Results Count */}
      <Text className="text-base font-black text-gray-600 mb-2 uppercase tracking-wide">
        {events?.length || 0} events found
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-gray-600 mt-4 text-lg font-semibold">Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <View className="px-8 pt-8 pb-4">
        <Text className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
          Events
        </Text>
        <Text className="text-lg text-gray-600 font-semibold">
          Manage your event portfolio
        </Text>
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
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#4F46E5" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <View className="bg-white rounded-[32px] p-16 items-center shadow-xl border-2 border-gray-50">
              <MaterialIcons name="event-busy" size={88} color="#d1d5db" />
              <Text className="text-2xl font-black text-gray-900 mt-6 mb-3">No events found</Text>
              <Text className="text-base text-gray-500 mb-8 text-center font-medium">
                Start creating amazing events for your community
              </Text>
              <TouchableOpacity
                className="rounded-2xl px-10 py-5 shadow-2xl"
                style={{ backgroundColor: '#4F46E5' }}
                onPress={() => router.push('/(admin)/events/create')}
                activeOpacity={0.85}
              >
                <Text className="text-lg font-black text-white">Create First Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}