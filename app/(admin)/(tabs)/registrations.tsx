// app/(admin)/(tabs)/registrations.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { BodyText, Caption, Heading3, Typography } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { Registration } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';

export default function RegistrationsScreen() {
  const { colors, spacing } = useTheme();
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
      case 'confirmed': return 'success';
      case 'attended': return 'primary';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      default: return 'muted';
    }
  };

  const getCaptionColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'attended': return 'primary';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      default: return 'gray';
    }
  };

  const renderRegistrationCard = ({ item }: { item: Registration }) => (
    <TouchableOpacity onPress={() => router.push(`/(admin)/registrations/${item.id}`)}>
      <Card className="mb-3 p-3">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Caption color="gray" className="mb-1">Event</Caption>
            <BodyText weight="semibold" numberOfLines={1}>{item.event?.name || 'Unknown Event'}</BodyText>
            
            <Caption color="gray" className="mt-2 mb-1">User</Caption>
            <BodyText numberOfLines={1}>{item.user?.firstName} {item.user?.lastName}</BodyText>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ 
              backgroundColor: colors[getStatusColor(item.status) as keyof typeof colors] + '20', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 4,
              marginBottom: 8
            }}>
              <Caption color={getCaptionColor(item.status) as any} style={{ fontWeight: 'bold', fontSize: 10 }}>
                {item.status.toUpperCase()}
              </Caption>
            </View>
            <Caption color="gray">{new Date(item.createdAt).toLocaleDateString()}</Caption>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Container safe>
      <View style={{ padding: spacing.md, paddingBottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading3 className="mb-4">Registrations</Heading3>
        <Button 
          size="sm" 
          leftIcon={<Ionicons name="qr-code-outline" size={18} color="white" />}
          onPress={() => router.push('/(admin)/scan')}
        >
          Scan
        </Button>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={registrations}
          renderItem={renderRegistrationCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} /> : null}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Typography color="gray">No registrations found</Typography>
            </View>
          }
        />
      )}
    </Container>
  );
}
