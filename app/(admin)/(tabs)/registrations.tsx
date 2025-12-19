// app/(admin)/(tabs)/registrations.tsx
import { RegistrationCard } from '@/components/cards';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Heading1 } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegistrationsScreen() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadRegistrations = async (pageNum = 1, isRefresh = false) => {
    try {
      if (!isRefresh && pageNum === 1) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);
      
      const response = await adminApi.getRegistrations({ page: pageNum });

      if (response.success && response.data) {
        if (pageNum === 1) {
          setRegistrations(response.data);
        } else {
          setRegistrations(prev => [...prev, ...response.data]);
        }
        setHasMore(
          response.meta?.current_page != null && 
          response.meta?.last_page != null && 
          response.meta.current_page < response.meta.last_page
        );
        setPage(pageNum);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Failed to load registrations:', error);
      Alert.alert('Error', 'Failed to load registrations');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRegistrations(1);
    }, [])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRegistrations(1, true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadRegistrations(page + 1);
    }
  }, [loadingMore, hasMore, page]);

  const renderListHeader = () => (
    <View className="mb-4 flex-row gap-2">
      <Button
        size="sm"
        variant="primary"
        gradient
        leftIcon={<Ionicons name="qr-code" size={18} color="white" />}
        onPress={() => router.push('/(admin)/scan')}
      >Scan QR</Button>
    </View>
  );

  if (loading && registrations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Loading fullScreen text="Loading registrations..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-5 pb-3">
        <Heading1 className="tracking-tight mb-1">Registrations</Heading1>
        <BodyText color="gray" weight="medium">{registrations.length > 0 ? `${registrations.length} registrations` : 'Track event attendees'}</BodyText>
      </View>
      <FlatList
        data={registrations}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderListHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <View className="py-6 items-center"><Loading size="small" /></View> : null}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Card variant="elevated" className="p-10 items-center">
              <Ionicons name="ticket-outline" size={64} color="#d1d5db" />
              <Text className="text-xl font-bold text-gray-900 mt-4">No registrations yet</Text>
              <Text className="text-sm text-gray-500 mt-2 text-center font-medium">Registrations will appear here as users sign up</Text>
            </Card>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RegistrationCard
            registration={item}
            onPress={() => router.push(`/(admin)/registrations/${item.id}`)}
            showEvent
            showUser
          />
        )}
      />
    </SafeAreaView>
  );
}
