// app/(admin)/events/[id].tsx
/**
 * Ultra-Premium Event Detail Screen
 * Enhanced with better spacing, colors, and component usage
 */

import { RegistrationCard } from '@/components/cards';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminApi } from '@/services/api/admin-api';
import { Event, Registration } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

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
      case 'draft': return '#6B7280';
      case 'published': return '#4F46E5';
      case 'ongoing': return '#f59e0b';
      case 'finished': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6B7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'draft': return '#F3F4F6';
      case 'published': return '#EEF2FF';
      case 'ongoing': return '#FEF3C7';
      case 'finished': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  if (loading || !event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-600 mt-4 text-lg font-semibold">Loading event...</Text>
      </SafeAreaView>
    );
  }

  const registrationProgress = Math.min((event.registeredCount / event.capacity) * 100, 100);
  const filteredRegistrations = registrations.filter(r => !filterStatus || r.status === filterStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <View className="bg-white px-6 py-4 flex-row items-center border-b-2 border-gray-100 shadow-md">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-12 h-12 justify-center items-center mr-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1 mx-2">
          <Text className="text-xl font-black text-gray-900" numberOfLines={1}>
            Event Details
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push(`/(admin)/events/${event.id}/edit` as any)}
          className="w-12 h-12 justify-center items-center bg-primary-50 rounded-2xl"
          activeOpacity={0.7}
        >
          <Ionicons name="create" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Enhanced Hero Image */}
        <View className="relative h-96">
          {event.imageUrl ? (
            <Image
              source={{ uri: getImageUrl(event.imageUrl) || undefined }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#4F46E5', '#6366f1', '#818cf8']}
              className="w-full h-full justify-center items-center"
            >
              <MaterialIcons name="event" size={96} color="rgba(255,255,255,0.25)" />
            </LinearGradient>
          )}
          
          {/* Enhanced Dark Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            className="absolute bottom-0 left-0 right-0 h-48"
          />

          {/* Enhanced Status & Featured Badges */}
          <View className="absolute top-6 right-6 flex-row gap-3">
            {event.isFeatured && (
              <View className="w-14 h-14 bg-warning-500 rounded-2xl items-center justify-center shadow-2xl border-2 border-warning-300">
                <Ionicons name="star" size={28} color="#ffffff" />
              </View>
            )}
            <View 
              className="px-6 py-3 rounded-2xl shadow-2xl border-2"
              style={{ 
                backgroundColor: getStatusBg(event.status),
                borderColor: getStatusColor(event.status)
              }}
            >
              <Text 
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: getStatusColor(event.status) }}
              >
                {event.status}
              </Text>
            </View>
          </View>

          {/* Enhanced Title Overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-8">
            <Text className="text-4xl font-black text-white mb-3 shadow-2xl">
              {event.name}
            </Text>
            <Text className="text-xl font-bold text-white/95 capitalize">
              {event.category}
            </Text>
          </View>
        </View>

        <View className="px-8 pb-10">
          {/* Enhanced Floating Stats Card */}
          <Card variant="premium" className="p-7 -mt-8 mb-6">
            <View className="flex-row">
              <View className="flex-1 items-center border-r-2 border-gray-200">
                <Ionicons name="people" size={28} color="#4F46E5" />
                <Text className="text-3xl font-black text-gray-900 mt-3 mb-1">
                  {event.registeredCount || 0}
                </Text>
                <Text className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                  / {event.capacity} Registered
                </Text>
              </View>
              
              <View className="flex-1 items-center">
                <Ionicons name="calendar" size={28} color="#14B8A6" />
                <Text className="text-3xl font-black text-gray-900 mt-3 mb-1">
                  {new Date(event.startDate).getDate()}
                </Text>
                <Text className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </Card>

          {/* Enhanced Registration Progress */}
          <Card variant="elevated" className="p-7 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-black text-gray-700 uppercase tracking-widest">
                Registration Progress
              </Text>
              <Text className="text-2xl font-black text-primary-600">
                {Math.round(registrationProgress)}%
              </Text>
            </View>
            <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${registrationProgress}%`,
                  backgroundColor: registrationProgress >= 100 ? '#ef4444' : '#4F46E5'
                }}
              />
            </View>
            <Text className="text-base text-gray-600 mt-3 font-semibold">
              {event.availableSeats > 0 
                ? `${event.availableSeats} seats remaining`
                : 'Event is full'}
            </Text>
          </Card>

          {/* Enhanced Event Information */}
          <Card variant="elevated" className="p-7 mb-6">
            <Text className="text-2xl font-black text-gray-900 mb-5">Event Information</Text>
            
            <InfoRow icon="calendar" label="Start Date" value={new Date(event.startDate).toLocaleString()} />
            <InfoRow icon="calendar" label="End Date" value={new Date(event.endDate).toLocaleString()} />
            <InfoRow icon="location" label="Location" value={event.location} />
            <InfoRow icon="map" label="Province / Commune" value={`${event.province} / ${event.commune}`} />
          </Card>

          {/* Enhanced Pricing */}
          <Card variant="elevated" className="p-7 mb-6">
            <Text className="text-2xl font-black text-gray-900 mb-5">Pricing</Text>
            
            <InfoRow icon="cash" label="Base Price" value={`${event.basePrice} DZD`} />
            {event.youthPrice && <InfoRow icon="person" label="Youth Price (<26)" value={`${event.youthPrice} DZD`} />}
            {event.seniorPrice && <InfoRow icon="person" label="Senior Price (≥60)" value={`${event.seniorPrice} DZD`} />}
            <InfoRow icon="people" label="Age Range" value={`${event.minAge}${event.maxAge ? ` - ${event.maxAge}` : '+'} years`} />
          </Card>

          {/* Description */}
          {event.description && (
            <Card variant="elevated" className="p-7 mb-6">
              <Text className="text-2xl font-black text-gray-900 mb-4">Description</Text>
              <Text className="text-lg text-gray-700 leading-7 font-medium">
                {event.description}
              </Text>
            </Card>
          )}

          {/* Game Details */}
          {event.eventType === 'game' && (
            <Card variant="elevated" className="p-7 mb-6">
              <Text className="text-2xl font-black text-gray-900 mb-5">Game Details</Text>
              
              {event.gameType && <InfoRow icon="game-controller" label="Game Type" value={event.gameType} />}
              {event.difficulty && <InfoRow icon="barbell" label="Difficulty" value={event.difficulty.toUpperCase()} />}
              {event.durationMinutes && <InfoRow icon="time" label="Duration" value={`${event.durationMinutes} minutes`} />}
              {event.physicalIntensity && <InfoRow icon="fitness" label="Physical Intensity" value={event.physicalIntensity.toUpperCase()} />}
            </Card>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Card variant="elevated" className="p-7 mb-6">
              <Text className="text-2xl font-black text-gray-900 mb-4">Tags</Text>
              <View className="flex-row flex-wrap gap-3">
                {event.tags.map((tag, index) => (
                  <View key={index} className="bg-secondary-100 px-5 py-3 rounded-2xl border-2 border-secondary-200">
                    <Text className="text-base font-bold text-secondary-700">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Enhanced Registrations Section */}
          <Card variant="elevated" className="p-7 mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-gray-900">
                Registrations ({registrations.length})
              </Text>
              <TouchableOpacity onPress={() => router.push(`/(admin)/(tabs)/registrations` as any)}>
                <Text className="text-base font-bold text-primary-600">View All →</Text>
              </TouchableOpacity>
            </View>

            {/* Enhanced Stats Grid */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-success-50 p-5 rounded-2xl border-l-4 border-success-600">
                <Text className="text-2xs text-gray-600 font-black uppercase tracking-wider">Confirmed</Text>
                <Text className="text-3xl font-black text-success-700 mt-2">
                  {registrations.filter(r => r.status === 'confirmed').length}
                </Text>
              </View>
              
              <View className="flex-1 bg-primary-50 p-5 rounded-2xl border-l-4 border-primary-600">
                <Text className="text-2xs text-gray-600 font-black uppercase tracking-wider">Attended</Text>
                <Text className="text-3xl font-black text-primary-700 mt-2">
                  {registrations.filter(r => r.status === 'attended').length}
                </Text>
              </View>
              
              <View className="flex-1 bg-warning-50 p-5 rounded-2xl border-l-4 border-warning-600">
                <Text className="text-2xs text-gray-600 font-black uppercase tracking-wider">Pending</Text>
                <Text className="text-3xl font-black text-warning-700 mt-2">
                  {registrations.filter(r => r.status === 'pending').length}
                </Text>
              </View>
            </View>

            {/* Enhanced Filter Pills */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              {['all', 'confirmed', 'attended', 'pending', 'canceled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilterStatus(status === 'all' ? '' : status)}
                  className={`px-5 py-3 rounded-2xl ${
                    filterStatus === (status === 'all' ? '' : status)
                      ? 'bg-primary-600 shadow-lg'
                      : 'bg-gray-100 border-2 border-gray-200'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-sm font-black uppercase tracking-wide ${
                    filterStatus === (status === 'all' ? '' : status)
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Registration List */}
            {filteredRegistrations.length > 0 ? (
              <>
                {filteredRegistrations.slice(0, 5).map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    onPress={() => router.push(`/(admin)/registrations/${registration.id}` as any)}
                    showEvent={false}
                  />
                ))}
                {filteredRegistrations.length > 5 && (
                  <TouchableOpacity
                    onPress={() => router.push(`/(admin)/(tabs)/registrations` as any)}
                    className="bg-gray-100 rounded-2xl py-4 items-center mt-3 border-2 border-gray-200"
                    activeOpacity={0.8}
                  >
                    <Text className="text-base font-black text-primary-600">
                      View {filteredRegistrations.length - 5} More →
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="people-outline" size={56} color="#d1d5db" />
                <Text className="text-gray-500 mt-3 font-semibold">
                  {filterStatus ? `No ${filterStatus} registrations` : 'No registrations yet'}
                </Text>
              </View>
            )}
          </Card>

          {/* Enhanced Action Button */}
          <Button
            variant="outline"
            size="lg"
            onPress={handleDelete}
            leftIcon={<Ionicons name="trash-outline" size={24} color="#ef4444" />}
            fullWidth
          >
            <Text className="text-error-600 font-black text-lg">Delete Event</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-start mb-5">
      <View className="w-12 h-12 rounded-2xl bg-gray-100 items-center justify-center mr-4">
        <Ionicons name={icon} size={24} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">
          {label}
        </Text>
        <Text className="text-lg text-gray-900 font-semibold">
          {value}
        </Text>
      </View>
    </View>
  );
}
