// app/(admin)/(tabs)/users.tsx
/**
 * Ultra-Premium Users List
 * Enhanced with better spacing and visual hierarchy
 */

import { Card } from '@/components/ui/Card';
import { adminApi } from '@/services/api/admin-api';
import { User } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (!isRefresh && pageNum === 1) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const response = await adminApi.getUsers({
        page: pageNum,
        search: searchQuery,
      });

      if (response.success && response.data) {
        const newUsers = response.data;
        if (pageNum === 1) {
          setUsers(newUsers);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
        }
        setHasMore(
          response.meta?.current_page != null && 
          response.meta?.last_page != null && 
          response.meta.current_page < response.meta.last_page
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(1, true);
  }, [loadUsers]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadUsers(page + 1);
    }
  }, [loadingMore, hasMore, page, loadUsers]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/(admin)/users/${item.id}`)}
      className="mb-4"
      activeOpacity={0.85}
    >
      <Card variant="elevated" className="p-6 flex-row items-center">
        {/* Enhanced Large Gradient Avatar */}
        <LinearGradient
          colors={['#4F46E5', '#6366f1', '#818cf8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-20 h-20 rounded-[20px] items-center justify-center mr-5 shadow-xl border-2 border-primary-200"
        >
          <Text className="text-white font-black text-3xl">
            {item.firstName[0]}{item.lastName[0]}
          </Text>
        </LinearGradient>
        
        <View className="flex-1">
          <Text className="text-xl font-black text-gray-900 mb-1">
            {item.firstName} {item.lastName}
          </Text>
          <Text className="text-base text-gray-600 font-medium mb-3">
            {item.email}
          </Text>
          
          {/* Enhanced Badges Row */}
          <View className="flex-row flex-wrap gap-2">
            {item.isBlocked && (
              <View className="bg-error-100 px-3 py-1.5 rounded-xl border-2 border-error-200">
                <Text className="text-2xs font-black text-error-700 uppercase tracking-widest">
                  BLOCKED
                </Text>
              </View>
            )}
            {!item.isActive && (
              <View className="bg-warning-100 px-3 py-1.5 rounded-xl border-2 border-warning-200">
                <Text className="text-2xs font-black text-warning-700 uppercase tracking-widest">
                  INACTIVE
                </Text>
              </View>
            )}
            {item.isEmailVerified && (
              <View className="bg-success-100 px-3 py-1.5 rounded-xl flex-row items-center border-2 border-success-200">
                <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                <Text className="text-2xs font-black text-success-700 uppercase tracking-widest ml-1">
                  VERIFIED
                </Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={28} color="#d1d5db" />
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-600 mt-4 text-lg font-semibold">Loading users...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <View className="px-8 pt-8 pb-4">
        <Text className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
          Users
        </Text>
        <Text className="text-lg text-gray-600 font-semibold">
          Manage community members
        </Text>
      </View>

      {/* Enhanced Search Bar */}
      <View className="px-8 pb-4">
        <View className="bg-white rounded-2xl px-5 border-2 border-gray-100 shadow-lg flex-row items-center">
          <Ionicons name="search" size={24} color="#9ca3af" />
          <TextInput
            className="flex-1 py-5 px-4 text-lg text-gray-900 font-medium"
            placeholder="Search by name or email..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={24} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#4F46E5" className="py-8" /> : null}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Card variant="elevated" className="p-16 items-center">
              <Ionicons name="people-outline" size={88} color="#d1d5db" />
              <Text className="text-2xl font-black text-gray-900 mt-6">No users found</Text>
              <Text className="text-base text-gray-500 mt-3 text-center font-medium">
                Try adjusting your search query
              </Text>
            </Card>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
