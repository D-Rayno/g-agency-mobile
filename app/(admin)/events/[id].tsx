// app/(admin)/events/[id].tsx
/**
 * Premium Event Detail Screen
 * Compact layout with reduced padding and efficient data display
 */

import { RegistrationCard } from '@/components/cards';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Typography } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { Event, Registration } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
    // Better id validation
    const eventId = id ? parseInt(String(id), 10) : NaN;
    
    if (!eventId || isNaN(eventId)) {
      console.log('Invalid event ID:', id, 'parsed:', eventId);
      Alert.alert('Error', 'Invalid event ID');
      router.back();
      return;
    }

    try {
      if (!isRefresh) setLoading(true);
      console.log('=== LOADING EVENT ===', eventId);

      const eventResponse = await adminApi.getEvent(eventId);
      console.log('Event response success:', eventResponse?.success);
      
      if (eventResponse?.success && eventResponse?.data) {
        setEvent(eventResponse.data);
      } else {
        console.log('Event response failed:', eventResponse);
        Alert.alert('Error', 'Event not found');
        router.back();
        return;
      }

      // Load registrations separately
      try {
        const registrationsResponse = await adminApi.getRegistrations({ event_id: eventId, limit: 100 });
        console.log('Registrations count:', registrationsResponse?.data?.length);
        
        if (registrationsResponse?.data && Array.isArray(registrationsResponse.data)) {
          setRegistrations(registrationsResponse.data);
        }
      } catch (regError) {
        console.log('Failed to load registrations (non-fatal):', regError);
      }
    } catch (error: any) {
      console.error('=== EVENT LOAD ERROR ===', error?.message || error);
      Alert.alert('Error', `Failed to load event: ${error?.message || 'Unknown error'}`);
      router.back();
    } finally {
      console.log('=== EVENT LOADING COMPLETE ===');
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

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || price === 0) return 'Free';
    return `${price.toLocaleString()} DZD`;
  };

  if (loading || !event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading fullScreen text="Loading event..." />
      </SafeAreaView>
    );
  }

  const registeredCount = event.registeredCount ?? 0;
  const capacity = event.capacity ?? 1;
  const registrationProgress = capacity > 0 ? Math.min((registeredCount / capacity) * 100, 100) : 0;
  const filteredRegistrations = registrations.filter(r => !filterStatus || r.status === filterStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Compact Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 justify-center items-center mr-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1 mr-2">
          <Typography variant="h6" weight="bold" numberOfLines={1}>
            Event Details
          </Typography>
        </View>
        <TouchableOpacity 
          onPress={() => router.push(`/(admin)/events/${event.id}/edit` as any)}
          className="w-10 h-10 justify-center items-center bg-primary-50 rounded-xl"
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#4F46E5" />
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
        {/* Hero Image - Reduced height */}
        <View className="relative h-56">
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
              <MaterialIcons name="event" size={64} color="rgba(255,255,255,0.25)" />
            </LinearGradient>
          )}
          
          {/* Dark Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            className="absolute bottom-0 left-0 right-0 h-32"
          />

          {/* Status & Featured Badges */}
          <View className="absolute top-4 right-4 flex-row gap-2">
            {event.isFeatured && (
              <View className="w-10 h-10 bg-warning-500 rounded-xl items-center justify-center">
                <Ionicons name="star" size={20} color="#ffffff" />
              </View>
            )}
            <StatusBadge status={event.status as any} />
          </View>

          {/* Title Overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <Text className="text-2xl font-bold text-white mb-1">
              {event.name}
            </Text>
            <View className="flex-row items-center">
              <View className="bg-white/20 px-2.5 py-1 rounded-lg">
                <Text className="text-sm font-bold text-white capitalize">{event.category}</Text>
              </View>
              {event.eventType === 'game' && event.gameType && (
                <View className="bg-warning-500/80 px-2.5 py-1 rounded-lg ml-2">
                  <Text className="text-sm font-bold text-white">{event.gameType}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="px-5 pb-8">
          {/* Floating Stats Card */}
          <Card variant="premium" className="p-4 -mt-6 mb-4">
            <View className="flex-row">
              <View className="flex-1 items-center border-r border-gray-200 pr-4">
                <Ionicons name="people" size={22} color="#4F46E5" />
                <Text className="text-xl font-bold text-gray-900 mt-2">
                  {registeredCount}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">/ {capacity}</Text>
              </View>
              
              <View className="flex-1 items-center border-r border-gray-200 px-4">
                <Ionicons name="calendar" size={22} color="#14B8A6" />
                <Text className="text-xl font-bold text-gray-900 mt-2">
                  {new Date(event.startDate).getDate()}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </View>

              <View className="flex-1 items-center pl-4">
                <Ionicons name="cash" size={22} color="#22c55e" />
                <Text className="text-xl font-bold text-gray-900 mt-2">
                  {!event.basePrice ? 'Free' : event.basePrice.toLocaleString()}
                </Text>
                {event.basePrice && event.basePrice > 0 && <Text className="text-xs text-gray-500 font-medium">DZD</Text>}
              </View>
            </View>
          </Card>

          {/* Capacity Progress */}
          <Card variant="elevated" className="p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-bold text-gray-700">Registration Progress</Text>
              <Text className="text-lg font-bold text-primary-600">
                {Math.round(registrationProgress)}%
              </Text>
            </View>
            <View className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${registrationProgress}%`,
                  backgroundColor: registrationProgress >= 100 ? '#ef4444' : registrationProgress >= 80 ? '#f59e0b' : '#4F46E5'
                }}
              />
            </View>
            <Text className="text-sm text-gray-600 mt-2 font-medium">
              {capacity - registeredCount > 0 
                ? `${capacity - registeredCount} seats remaining`
                : 'Event is full'}
            </Text>
          </Card>

          {/* Event Information - Compact */}
          <Card variant="elevated" className="p-4 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Event Information</Text>
            
            <InfoRow icon="calendar" label="Start" value={new Date(event.startDate).toLocaleString()} />
            <InfoRow icon="calendar" label="End" value={new Date(event.endDate).toLocaleString()} />
            <InfoRow icon="location" label="Location" value={event.location} />
            <InfoRow icon="map" label="Province" value={`${event.province} / ${event.commune}`} isLast />
          </Card>

          {/* Pricing - Compact */}
          <Card variant="elevated" className="p-4 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Pricing</Text>
            
            <InfoRow icon="cash" label="Base Price" value={formatPrice(event.basePrice)} />
            {event.youthPrice && <InfoRow icon="person" label="Youth (<26)" value={formatPrice(event.youthPrice)} />}
            {event.seniorPrice && <InfoRow icon="person" label="Senior (≥60)" value={formatPrice(event.seniorPrice)} />}
            <InfoRow icon="people" label="Age Range" value={`${event.minAge}${event.maxAge ? ` - ${event.maxAge}` : '+'} years`} isLast />
          </Card>

          {/* Description */}
          {event.description && (
            <Card variant="elevated" className="p-4 mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Description</Text>
              <Text className="text-base text-gray-700 leading-6">
                {event.description}
              </Text>
            </Card>
          )}

          {/* Game Details */}
          {event.eventType === 'game' && (
            <Card variant="elevated" className="p-4 mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-4">Game Details</Text>
              
              {event.gameType && <InfoRow icon="game-controller" label="Game Type" value={event.gameType} />}
              {event.difficulty && <InfoRow icon="barbell" label="Difficulty" value={event.difficulty.toUpperCase()} />}
              {event.durationMinutes && <InfoRow icon="time" label="Duration" value={`${event.durationMinutes} min`} />}
              {event.physicalIntensity && <InfoRow icon="fitness" label="Intensity" value={event.physicalIntensity.toUpperCase()} isLast />}
            </Card>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Card variant="elevated" className="p-4 mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <View key={index} className="bg-secondary-100 px-3 py-1.5 rounded-full border border-secondary-200">
                    <Text className="text-sm font-medium text-secondary-700">{tag}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Registrations Section */}
          <Card variant="elevated" className="p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">
                Registrations ({registrations.length})
              </Text>
              <TouchableOpacity onPress={() => router.push(`/(admin)/(tabs)/registrations` as any)}>
                <Text className="text-sm font-bold text-primary-600">View All →</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Grid - Compact */}
            <View className="flex-row gap-2 mb-4">
              <View className="flex-1 bg-success-50 p-3 rounded-xl border-l-4 border-success-600">
                <Text className="text-xs text-gray-600 font-bold">Confirmed</Text>
                <Text className="text-xl font-bold text-success-700 mt-1">
                  {registrations.filter(r => r.status === 'confirmed').length}
                </Text>
              </View>
              
              <View className="flex-1 bg-primary-50 p-3 rounded-xl border-l-4 border-primary-600">
                <Text className="text-xs text-gray-600 font-bold">Attended</Text>
                <Text className="text-xl font-bold text-primary-700 mt-1">
                  {registrations.filter(r => r.status === 'attended').length}
                </Text>
              </View>
              
              <View className="flex-1 bg-warning-50 p-3 rounded-xl border-l-4 border-warning-600">
                <Text className="text-xs text-gray-600 font-bold">Pending</Text>
                <Text className="text-xl font-bold text-warning-700 mt-1">
                  {registrations.filter(r => r.status === 'pending').length}
                </Text>
              </View>
            </View>

            {/* Filter Pills - Compact */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {['all', 'confirmed', 'attended', 'pending', 'canceled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilterStatus(status === 'all' ? '' : status)}
                  className={`px-3 py-1.5 rounded-full ${
                    filterStatus === (status === 'all' ? '' : status)
                      ? 'bg-primary-600'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-xs font-bold ${
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
                    className="bg-gray-100 rounded-xl py-3 items-center mt-2 border border-gray-200"
                    activeOpacity={0.8}
                  >
                    <Text className="text-sm font-bold text-primary-600">
                      View {filteredRegistrations.length - 5} More →
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View className="items-center py-8">
                <Ionicons name="people-outline" size={40} color="#d1d5db" />
                <Text className="text-gray-500 mt-2 font-medium">
                  {filterStatus ? `No ${filterStatus} registrations` : 'No registrations yet'}
                </Text>
              </View>
            )}
          </Card>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="md"
            onPress={handleDelete}
            leftIcon={<Ionicons name="trash-outline" size={20} color="#ef4444" />}
            fullWidth
          >
            <Text className="text-error-600 font-bold">Delete Event</Text>
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
  isLast?: boolean;
}

function InfoRow({ icon, label, value, isLast = false }: InfoRowProps) {
  return (
    <View className={`flex-row items-start ${!isLast ? 'mb-3' : ''}`}>
      <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-0.5">
          {label}
        </Text>
        <Text className="text-base text-gray-900 font-medium">
          {value}
        </Text>
      </View>
    </View>
  );
}
