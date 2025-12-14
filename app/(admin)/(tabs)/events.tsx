// app/(admin)/(tabs)/events.tsx - Complete Event Management
import { adminApi } from '@/services/api/admin-api';
import { Event } from '@/types/admin';
import { getImageUrl } from '@/utils/image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Sport', value: 'sport' },
  { label: 'Culture', value: 'culture' },
  { label: 'Game', value: 'game' },
  { label: 'Workshop', value: 'workshop' },
];

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Finished', value: 'finished' },
];

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadEvents = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (!isRefresh && pageNum === 1) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const response = await adminApi.getEvents({
        page: pageNum,
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
      });

      if (response.success && response.data) {
        const newEvents = response.data;
        
        if (pageNum === 1) {
          setEvents(newEvents);
        } else {
          setEvents(prev => [...prev, ...newEvents]);
        }

        setHasMore(
          response.meta?.current_page != null && 
          response.meta?.last_page != null && 
          response.meta.current_page < response.meta.last_page
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      loadEvents(1);
    }, [searchQuery, selectedCategory, selectedStatus])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents(1, true);
  }, [loadEvents]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadEvents(page + 1);
    }
  }, [loadingMore, hasMore, page, loadEvents]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setPage(1);
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'excel') => {
    try {
      Alert.alert(
        'Export Events',
        `Export ${format.toUpperCase()} with current filters?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: async () => {
              try {
                if (format === 'csv') {
                  await adminApi.exportEventsCSV({ 
                    category: selectedCategory,
                    status: selectedStatus 
                  });
                } else {
                  await adminApi.exportEventsExcel({ 
                    category: selectedCategory,
                    status: selectedStatus 
                  });
                }
                Alert.alert('Success', `Events exported as ${format.toUpperCase()}`);
              } catch (error) {
                Alert.alert('Error', 'Failed to export events');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
    }
  }, [selectedCategory, selectedStatus]);

  const handleDeleteEvent = useCallback(async (event: Event) => {
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
              loadEvents(1);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete event');
            }
          },
        },
      ]
    );
  }, [loadEvents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6B7280';
      case 'published': return '#3B82F6';
      case 'ongoing': return '#F59E0B';
      case 'finished': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/(admin)/events/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Event Image */}
      <View style={styles.eventImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: getImageUrl(item.imageUrl) || undefined }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.eventImagePlaceholder}>
            <MaterialIcons name="event" size={40} color="#9CA3AF" />
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.detailText}>{item.province}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.detailText}>
              {new Date(item.startDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="people" size={16} color="#1F6F61" style={{ marginRight: 4 }} />
            <Text style={styles.statText}>
              {item.registeredCount}/{item.capacity}
            </Text>
          </View>
          
          {item.eventType === 'game' && (
            <View style={styles.gameTypeBadge}>
              <Ionicons name="game-controller" size={14} color="#F37021" style={{ marginRight: 4 }} />
              <Text style={styles.gameTypeText}>{item.gameType}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { marginRight: 8 }]}
            onPress={() => router.push(`/(admin)/events/${item.id}/edit`)}
          >
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteEvent(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color="#1F6F61" style={{ marginRight: 6 }} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, { marginRight: 8 }]}
          onPress={() => {
            Alert.alert('Export Format', 'Choose export format', [
              { text: 'CSV', onPress: () => handleExport('csv') },
              { text: 'Excel', onPress: () => handleExport('excel') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <Ionicons name="download-outline" size={20} color="#F37021" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(admin)/events/create')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Category</Text>
          <View style={styles.filterChips}>
            {CATEGORY_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterChip,
                  { marginRight: 8, marginBottom: 8 },
                  selectedCategory === filter.value && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(filter.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === filter.value && styles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.filterChips}>
            {STATUS_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterChip,
                  { marginRight: 8, marginBottom: 8 },
                  selectedStatus === filter.value && styles.filterChipActive
                ]}
                onPress={() => setSelectedStatus(filter.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedStatus === filter.value && styles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results Count */}
      <Text style={styles.resultsCount}>{events?.length || 0} events found</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F6F61" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1F6F61']}
            tintColor="#1F6F61"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#1F6F61" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No events found</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(admin)/events/create')}
            >
              <Text style={styles.createButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#11181C',
  },
  actionBar: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F6F61',
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F6F61',
  },
  exportButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F37021',
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1F6F61',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#1F6F61',
    borderColor: '#1F6F61',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultsCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImageContainer: {
    position: 'relative',
    height: 160,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventInfo: {
    padding: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F6F61',
  },
  gameTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gameTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F37021',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#1F6F61',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});