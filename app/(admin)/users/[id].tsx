// app/(admin)/users/[id].tsx
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { BodyText, Caption, Heading2, Heading3 } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { Registration, User } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
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
  const { colors, spacing, radius } = useTheme();
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadUser = async (isRefresh = false) => {
    if (!id) return;

    try {
      if (!isRefresh) setLoading(true);

      const response = await adminApi.getUser(Number(id));
      
      if (response.success && response.data) {
        setUser(response.data as UserDetailData);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
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

    try {
      await adminApi.toggleUserBlock(user.id);
      Alert.alert('Success', `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
      loadUser(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;

    try {
      await adminApi.toggleUserActive(user.id);
      Alert.alert('Success', `User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUser(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleDelete = () => {
    if (!user) return;

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
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

  const renderRegistrationItem = ({ item }: { item: Registration }) => (
    <TouchableOpacity onPress={() => router.push(`/(admin)/registrations/${item.id}` as any)}>
      <Card className="mb-3 p-3">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <BodyText weight="semibold" numberOfLines={1}>{item.event?.name || 'Unknown Event'}</BodyText>
            <Caption color="gray">{new Date(item.createdAt).toLocaleDateString()}</Caption>
          </View>
          <Badge
            variant={
              item.status === 'attended' ? 'success' :
              item.status === 'confirmed' ? 'primary' :
              item.status === 'canceled' ? 'error' : 'warning'
            }
            size="sm"
          >
            {item.status.toUpperCase()}
          </Badge>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <BodyText weight="semibold">User Details</BodyText>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={user.registrations || []}
          renderItem={renderRegistrationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* User Profile Header */}
              <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                  {user.avatarUrl ? (
                    <Image
                      source={{ uri: getImageUrl(user.avatarUrl) || undefined }}
                      style={styles.avatar}
                    />
                  ) : (
                    <BodyText weight="bold" style={{ fontSize: 32, color: colors.primary }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </BodyText>
                  )}
                </View>

                <Heading2 className="mt-4 mb-2">{user.fullName}</Heading2>
                <BodyText color="gray" className="mb-3">{user.email}</BodyText>

                {/* Badges */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {user.isEmailVerified && (
                    <Badge variant="success" size="sm" style={{ marginRight: 8, marginBottom: 8 }}>
                      <Ionicons name="checkmark-circle" size={12} color="#fff" style={{ marginRight: 4 }} />
                      VERIFIED
                    </Badge>
                  )}
                  {user.isBlocked && (
                    <Badge variant="error" size="sm" style={{ marginRight: 8, marginBottom: 8 }}>
                      <Ionicons name="ban" size={12} color="#fff" style={{ marginRight: 4 }} />
                      BLOCKED
                    </Badge>
                  )}
                  {!user.isActive && (
                    <Badge variant="warning" size="sm" style={{ marginRight: 8, marginBottom: 8 }}>
                      INACTIVE
                    </Badge>
                  )}
                  {user.isAdmin && (
                    <Badge variant="primary" size="sm" style={{ marginBottom: 8 }}>
                      <Ionicons name="shield-checkmark" size={12} color="#fff" style={{ marginRight: 4 }} />
                      ADMIN
                    </Badge>
                  )}
                </View>
              </View>

              {/* Stats Cards */}
              {user.stats && (
                <View style={{ padding: spacing.md }}>
                  <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
                    <StatCard
                      label="Total"
                      value={user.stats.total}
                      icon="receipt-outline"
                      color={colors.primary}
                      containerStyle={{ marginRight: spacing.sm }}
                    />
                    <StatCard
                      label="Confirmed"
                      value={user.stats.confirmed}
                      icon="checkmark-circle-outline"
                      color={colors.success}
                    />
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <StatCard
                      label="Attended"
                      value={user.stats.attended}
                      icon="person-circle-outline"
                      color={colors.warning}
                      containerStyle={{ marginRight: spacing.sm }}
                    />
                    <StatCard
                      label="Canceled"
                      value={user.stats.canceled}
                      icon="close-circle-outline"
                      color={colors.danger}
                    />
                  </View>
                </View>
              )}

              {/* User Info */}
              <Card className="mx-4 mb-4 p-4">
                <Heading3 className="mb-3">Information</Heading3>
                <InfoRow icon="calendar-outline" label="Age" value={`${user.age} years`} />
                <InfoRow icon="location-outline" label="Province" value={user.province} />
                <InfoRow icon="location-outline" label="Commune" value={user.commune} />
                {user.phoneNumber && <InfoRow icon="call-outline" label="Phone" value={user.phoneNumber} />}
                <InfoRow icon="calendar-outline" label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              </Card>

              {/* Actions */}
              <View style={{ padding: spacing.md }}>
                <Button
                  variant={user.isBlocked ? 'primary' : 'outline'}
                  onPress={handleToggleBlock}
                  style={{ marginBottom: spacing.sm }}
                >
                  <Ionicons 
                    name={user.isBlocked ? 'checkmark-circle-outline' : 'ban-outline'} 
                    size={20} 
                    color={user.isBlocked ? '#fff' : colors.danger}
                    style={{ marginRight: 8 }}
                  />
                  {user.isBlocked ? 'Unblock User' : 'Block User'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onPress={handleToggleActive}
                  style={{ marginBottom: spacing.sm }}
                >
                  <Ionicons name="power-outline" size={20} color={colors.warning} style={{ marginRight: 8 }} />
                  {user.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
                
                <Button variant="outline" onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
                  Delete User
                </Button>
              </View>

              <View style={{ padding: spacing.md }}>
                <Heading3 className="mb-3">Registration History</Heading3>
              </View>
            </>
          }
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="document-text-outline" size={48} color={colors.muted} />
              <Caption color="gray" className="mt-2">No registrations found</Caption>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  containerStyle?: any;
}

function StatCard({ label, value, icon, color, containerStyle }: StatCardProps) {
  return (
    <Card style={[{ flex: 1, padding: 16 }, containerStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 20, 
          backgroundColor: color + '20', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginRight: 12 
        }}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Caption color="gray">{label}</Caption>
          <Heading3>{value}</Heading3>
        </View>
      </View>
    </Card>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm }}>
      <Ionicons name={icon} size={20} color={colors.muted} style={{ marginRight: spacing.sm, marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Caption color="gray">{label}</Caption>
        <BodyText>{value}</BodyText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
