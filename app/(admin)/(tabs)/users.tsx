// app/(admin)/(tabs)/users.tsx
import { UserCard } from '@/components/cards';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Heading1, Typography } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { User } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadUsers = async (pageNum = 1, isRefresh = false) => {
    try {
      if (!isRefresh && pageNum === 1) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const response = await adminApi.getUsers({ page: pageNum });

      if (response.success && response.data) {
        if (pageNum === 1) {
          setUsers(response.data);
        } else {
          setUsers(prev => [...prev, ...response.data]);
        }
        setHasMore(
          response.meta?.current_page != null &&
          response.meta?.last_page != null &&
          response.meta.current_page < response.meta.last_page
        );
        setPage(pageNum);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers(1);
    }, [])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(1, true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadUsers(page + 1);
    }
  }, [loadingMore, hasMore, page]);

  if (loading && users.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading fullScreen text="Loading users..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-5 pb-3">
        <Heading1 className="tracking-tight mb-1">Users</Heading1>
        <BodyText color="gray" weight="medium">{users.length > 0 ? `${users.length} users` : 'Manage your community'}</BodyText>
      </View>
      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <View className="py-6 items-center"><Loading size="small" /></View> : null}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Card variant="elevated" className="p-10 items-center">
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Typography variant="h5" weight="bold" className="mt-4 mb-2">No users found</Typography>
              <BodyText color="gray" weight="medium" align="center">Users will appear here as they register</BodyText>
            </Card>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={() => router.push(`/(admin)/users/${item.id}`)}
            showDetails
          />
        )}
      />
    </SafeAreaView>
  );
}
