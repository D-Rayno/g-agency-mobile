// app/(admin)/(tabs)/users.tsx
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { BodyText, Caption, Heading3, Typography } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { User } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, TextInput, TouchableOpacity, View } from 'react-native';

export default function UsersScreen() {
  const { colors, spacing } = useTheme();
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
    <TouchableOpacity onPress={() => router.push(`/(admin)/users/${item.id}`)}>
      <Card className="mb-3 flex-row items-center gap-3 p-3">
        <View style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 24, 
          backgroundColor: colors.primary + '20', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Typography variant="h5" weight="bold" color="primary">
            {item.firstName[0]}{item.lastName[0]}
          </Typography>
        </View>
        
        <View style={{ flex: 1 }}>
          <BodyText weight="semibold">{item.firstName} {item.lastName}</BodyText>
          <Caption>{item.email}</Caption>
          <View style={{ flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' }}>
            {item.isBlocked && (
              <Badge variant="error" size="sm" style={{ marginRight: 8, marginBottom: 4 }}>
                BLOCKED
              </Badge>
            )}
            {!item.isActive && (
              <Badge variant="warning" size="sm" style={{ marginRight: 8, marginBottom: 4 }}>
                INACTIVE
              </Badge>
            )}
            {item.isEmailVerified && (
              <Badge variant="success" size="sm" style={{ marginBottom: 4 }}>
                VERIFIED
              </Badge>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <Container safe>
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <Heading3 className="mb-4">Users</Heading3>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: colors.card, 
          borderRadius: 12, 
          paddingHorizontal: 12, 
          borderWidth: 1, 
          borderColor: colors.border,
          marginBottom: spacing.md
        }}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={{ flex: 1, padding: 12, color: colors.text }}
            placeholder="Search users..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
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
              <Typography color="gray">No users found</Typography>
            </View>
          }
        />
      )}
    </Container>
  );
}
