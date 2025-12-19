// app/(admin)/users/[id].tsx
/**
 * Premium User Detail Screen
 * Enhanced with better styling and efficient data display
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Caption, Heading3, Typography } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { Registration, User } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserDetailData extends User {
  stats?: {
    total: number;
    confirmed: number;
    attended: number;
    canceled: number;
  };
  registrations?: Registration[];
}

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUser = async (isRefresh = false) => {
    if (!id) return;

    try {
      if (!isRefresh) setLoading(true);

      const response = await adminApi.getUser(Number(id));
      
      if (response.success && response.data) {
        setUser(response.data as UserDetailData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUser(true);
  };

  const handleToggleBlock = async () => {
    if (!user) return;

    Alert.alert(
      user.isBlocked ? 'Unblock User' : 'Block User',
      `Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: user.isBlocked ? 'Unblock' : 'Block',
          style: user.isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await adminApi.toggleUserBlock(user.id);
              Alert.alert('Success', `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
              loadUser(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user status');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async () => {
    if (!user) return;

    Alert.alert(
      user.isActive ? 'Deactivate Account' : 'Activate Account',
      `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await adminApi.toggleUserActive(user.id);
              Alert.alert('Success', `User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
              loadUser(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user status');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!user) return;

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteUser(user.id);
              Alert.alert('Success', 'User deleted successfully');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended': return '#22c55e';
      case 'confirmed': return '#4F46E5';
      case 'canceled': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'attended': return 'bg-success-100';
      case 'confirmed': return 'bg-primary-100';
      case 'canceled': return 'bg-error-100';
      case 'pending': return 'bg-warning-100';
      default: return 'bg-gray-100';
    }
  };

  const renderRegistrationItem = ({ item }: { item: Registration }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/(admin)/registrations/${item.id}` as any)}
      className="mb-3"
      activeOpacity={0.85}
    >
      <Card variant="elevated" className="p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {item.event?.name || 'Unknown Event'}
            </Text>
            <Text className="text-xs text-gray-500 font-medium mt-1">
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${getStatusBg(item.status)}`}>
            <Text 
              className="text-xs font-bold uppercase"
              style={{ color: getStatusColor(item.status) }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading fullScreen text="Loading user..." />
      </SafeAreaView>
    );
  }

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
          <Typography variant="h6" weight="bold">User Details</Typography>
        </View>
        <TouchableOpacity
          onPress={handleToggleBlock}
          className={`px-3 py-2 rounded-xl ${user.isBlocked ? 'bg-success-100' : 'bg-error-50'}`}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={user.isBlocked ? 'checkmark-circle' : 'ban'} 
            size={20} 
            color={user.isBlocked ? '#22c55e' : '#ef4444'} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={user.registrations || []}
        renderItem={renderRegistrationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
        ListHeaderComponent={
          <>
            {/* Profile Hero */}
            <LinearGradient
              colors={['#4F46E5', '#6366f1', '#818cf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="pt-8 pb-16 px-5"
            >
              <View className="items-center">
                {/* Avatar */}
                <View className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white/20">
                  {user.avatarUrl ? (
                    <Image
                      source={{ uri: getImageUrl(user.avatarUrl) || undefined }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Typography variant="h1" weight="bold" color="white">
                        {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                      </Typography>
                    </View>
                  )}
                </View>

                {/* Name */}
                <Typography variant="h3" weight="bold" color="white" className="mt-4">
                  {user.firstName} {user.lastName}
                </Typography>
                <Text className="text-white/90 font-medium mt-1">{user.email}</Text>

                {/* Status Badges */}
                <View className="flex-row flex-wrap justify-center gap-2 mt-4">
                  {user.isEmailVerified && (
                    <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center">
                      <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
                      <Text className="text-white text-xs font-bold ml-1">Verified</Text>
                    </View>
                  )}
                  {user.isBlocked && (
                    <View className="bg-error-500/80 px-3 py-1.5 rounded-full flex-row items-center">
                      <Ionicons name="ban" size={14} color="#ffffff" />
                      <Text className="text-white text-xs font-bold ml-1">Blocked</Text>
                    </View>
                  )}
                  {!user.isActive && (
                    <View className="bg-warning-500/80 px-3 py-1.5 rounded-full">
                      <Text className="text-white text-xs font-bold">Inactive</Text>
                    </View>
                  )}
                  {user.isAdmin && (
                    <View className="bg-success-500/80 px-3 py-1.5 rounded-full flex-row items-center">
                      <Ionicons name="shield-checkmark" size={14} color="#ffffff" />
                      <Text className="text-white text-xs font-bold ml-1">Admin</Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>

            {/* Stats Card */}
            {user.stats && (
              <View className="px-5 -mt-10 mb-4">
                <Card variant="premium" className="p-4">
                  <View className="flex-row">
                    <View className="flex-1 items-center border-r border-gray-200">
                      <Text className="text-2xl font-bold text-gray-900">{user.stats.total}</Text>
                      <Text className="text-xs text-gray-500 font-bold mt-1">Total</Text>
                    </View>
                    <View className="flex-1 items-center border-r border-gray-200">
                      <Text className="text-2xl font-bold text-success-600">{user.stats.confirmed}</Text>
                      <Text className="text-xs text-gray-500 font-bold mt-1">Confirmed</Text>
                    </View>
                    <View className="flex-1 items-center border-r border-gray-200">
                      <Text className="text-2xl font-bold text-primary-600">{user.stats.attended}</Text>
                      <Text className="text-xs text-gray-500 font-bold mt-1">Attended</Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-2xl font-bold text-error-600">{user.stats.canceled}</Text>
                      <Text className="text-xs text-gray-500 font-bold mt-1">Canceled</Text>
                    </View>
                  </View>
                </Card>
              </View>
            )}

            {/* User Information */}
            <Card className="mx-5 mb-4 p-4">
              <Heading3 className="mb-4">Personal Information</Heading3>
              
              <InfoRow icon="calendar-outline" label="Age" value={`${user.age || 'N/A'} years`} />
              <InfoRow icon="location-outline" label="Province" value={user.province || 'N/A'} />
              <InfoRow icon="map-outline" label="Commune" value={user.commune || 'N/A'} />
              {user.phoneNumber && <InfoRow icon="call-outline" label="Phone" value={user.phoneNumber} />}
              <InfoRow 
                icon="time-outline" 
                label="Joined" 
                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })} 
                isLast 
              />
            </Card>

            {/* Actions */}
            <View className="px-5 mb-4 gap-2">
              <Button
                variant={user.isBlocked ? 'primary' : 'outline'}
                onPress={handleToggleBlock}
                leftIcon={
                  <Ionicons 
                    name={user.isBlocked ? 'checkmark-circle-outline' : 'ban-outline'} 
                    size={20} 
                    color={user.isBlocked ? '#fff' : '#ef4444'} 
                  />
                }
                fullWidth
              >
                {user.isBlocked ? 'Unblock User' : 'Block User'}
              </Button>
              
              <Button 
                variant="outline" 
                onPress={handleToggleActive}
                leftIcon={<Ionicons name="power-outline" size={20} color="#f59e0b" />}
                fullWidth
              >
                {user.isActive ? 'Deactivate Account' : 'Activate Account'}
              </Button>
              
              <Button 
                variant="outline" 
                onPress={handleDelete}
                leftIcon={<Ionicons name="trash-outline" size={20} color="#ef4444" />}
                fullWidth
              >
                Delete User
              </Button>
            </View>

            {/* Registrations Section Header */}
            <View className="px-5 mb-4">
              <Heading3>Registration History</Heading3>
            </View>
          </>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Card variant="elevated" className="p-8 items-center">
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <BodyText color="gray" weight="medium" className="mt-3">No registrations found</BodyText>
            </Card>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
    <View className={`flex-row items-center ${!isLast ? 'mb-3 pb-3 border-b border-gray-100' : ''}`}>
      <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#4F46E5" />
      </View>
      <View className="flex-1">
        <Caption weight="bold" className="text-gray-500 uppercase tracking-wide mb-0.5">
          {label}
        </Caption>
        <BodyText weight="semibold">{value}</BodyText>
      </View>
    </View>
  );
}
