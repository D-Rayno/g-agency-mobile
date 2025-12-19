// app/(admin)/registrations/[id].tsx
/**
 * Premium Registration Detail Screen
 * Enhanced with better styling and QR code display
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Caption, Typography } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { registrationsService } from '@/services/api/registrations.service';
import { Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegistrationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const handleMarkAttended = async () => {
    if (!registration) return;

    try {
      await registrationsService.confirmAttendance({ qrCode: registration.qrCode });
      Alert.alert('Success', 'Registration marked as attended');
      loadRegistration(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark as attended');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'attended':
        return { color: '#22c55e', bg: 'bg-success-100', label: 'ATTENDED', icon: 'checkmark-circle' };
      case 'confirmed':
        return { color: '#4F46E5', bg: 'bg-primary-100', label: 'CONFIRMED', icon: 'checkmark-done' };
      case 'canceled':
        return { color: '#ef4444', bg: 'bg-error-100', label: 'CANCELED', icon: 'close-circle' };
      case 'pending':
        return { color: '#f59e0b', bg: 'bg-warning-100', label: 'PENDING', icon: 'time' };
      default:
        return { color: '#6b7280', bg: 'bg-gray-100', label: status.toUpperCase(), icon: 'help-circle' };
    }
  };

  if (loading || !registration) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading fullScreen text="Loading registration..." />
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(registration.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 justify-center items-center mr-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Typography variant="h6" weight="bold">Registration Details</Typography>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Status Hero */}
        <LinearGradient
          colors={[statusConfig.color, statusConfig.color + 'dd', statusConfig.color + 'aa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-5 py-8 items-center"
        >
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4">
            <Ionicons name={statusConfig.icon as any} size={48} color="#ffffff" />
          </View>
          <Text className="text-2xl font-bold text-white tracking-wider">
            {statusConfig.label}
          </Text>
          <Text className="text-white/90 font-medium mt-1">
            Registration #{registration.id}
          </Text>
        </LinearGradient>

        <View className="px-5 pb-10">
          {/* QR Code Card */}
          {registration.status !== 'canceled' && (
            <Card variant="premium" className="p-6 -mt-8 mb-4 items-center">
              <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Scan QR Code
              </Text>
              
              <View className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-lg items-center justify-center" style={{ width: 200, height: 200 }}>
                <Ionicons name="qr-code" size={140} color="#111827" />
              </View>
              
              <View className="mt-4 px-4 py-2 bg-gray-100 rounded-lg w-full">
                <Text className="text-xs text-gray-500 text-center font-mono" numberOfLines={1}>
                  {registration.qrCode}
                </Text>
              </View>
              
              <Text className="text-xs text-gray-500 mt-3 text-center">
                Scan this code at the event entrance
              </Text>
            </Card>
          )}

          {/* Event Information */}
          <Card variant="elevated" className="p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color="#4F46E5" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Event Details</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/events/${registration.eventId}` as any)}
              activeOpacity={0.7}
            >
              <InfoRow
                icon="ticket-outline"
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
              value={registration.event 
                ? new Date(registration.event.startDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : 'N/A'}
            />
            <InfoRow
              icon="time-outline"
              label="End Date"
              value={registration.event 
                ? new Date(registration.event.endDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : 'N/A'}
              isLast
            />
          </Card>

          {/* User Information */}
          <Card variant="elevated" className="p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-secondary-100 items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#14B8A6" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Participant Details</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/users/${registration.userId}` as any)}
              activeOpacity={0.7}
            >
              <InfoRow
                icon="person-outline"
                label="Name"
                value={registration.user 
                  ? `${registration.user.firstName} ${registration.user.lastName}` 
                  : 'Unknown User'}
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
          <Card variant="elevated" className="p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-warning-100 items-center justify-center mr-3">
                <Ionicons name="receipt" size={20} color="#f59e0b" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Registration Info</Text>
            </View>
            
            <InfoRow 
              icon="cash-outline" 
              label="Price Paid" 
              value={registration.price ? `${registration.price.toLocaleString()} DZD` : 'Free'} 
            />
            <InfoRow
              icon="calendar-outline"
              label="Registered On"
              value={new Date(registration.createdAt).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            />
            {registration.attendedAt && (
              <InfoRow
                icon="checkmark-circle-outline"
                label="Attended On"
                value={new Date(registration.attendedAt).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              />
            )}
            {registration.updatedAt && (
              <InfoRow
                icon="time-outline"
                label="Last Updated"
                value={new Date(registration.updatedAt).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                isLast
              />
            )}
          </Card>

          {/* Actions */}
          {registration.status !== 'canceled' && (
            <View className="gap-3">
              {registration.status === 'confirmed' && (
                <Button
                  variant="primary"
                  gradient
                  onPress={handleMarkAttended}
                  leftIcon={<Ionicons name="checkmark-circle" size={20} color="#ffffff" />}
                  fullWidth
                >
                  Mark as Attended
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onPress={handleCancel}
                leftIcon={<Ionicons name="close-circle-outline" size={20} color="#ef4444" />}
                fullWidth
              >
                Cancel Registration
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showChevron?: boolean;
  isLast?: boolean;
}

function InfoRow({ icon, label, value, showChevron, isLast = false }: InfoRowProps) {
  return (
    <View className={`flex-row items-center ${!isLast ? 'mb-3 pb-3 border-b border-gray-100' : ''}`}>
      <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Caption weight="bold" className="text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </Caption>
        <BodyText weight="semibold">{value}</BodyText>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </View>
  );
}
