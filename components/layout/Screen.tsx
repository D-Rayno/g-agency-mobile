// components/layout/Screen.tsx
/**
 * Enhanced Screen Container Component with FlatList Support
 * Modern design with refined styling and smooth interactions
 */

import {
  useCallback,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps<T = any> = {
  data?: T[];
  renderItem?: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  onRefresh?: () => Promise<void> | void;
  onInfinite?: () => Promise<void> | void;
  refreshing?: boolean;
  loadingMore?: boolean;
  children?: ReactNode;
  contentContainerStyle?: ViewStyle;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null;
  ListFooterComponent?: ComponentType<any> | ReactElement | null;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null;
  showsVerticalScrollIndicator?: boolean;
  backgroundColor?: string;
};

export function Screen<T = any>({
  data = [],
  renderItem,
  keyExtractor,
  onRefresh,
  onInfinite,
  refreshing,
  loadingMore,
  children,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  showsVerticalScrollIndicator = false,
  backgroundColor = '#F9FAFB',
}: ScreenProps<T>) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    try {
      setInternalRefreshing(true);
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setInternalRefreshing(false);
    }
  }, [onRefresh]);

  const handleEndReached = useCallback(() => {
    if (loadingMore || !onInfinite) return;
    onInfinite();
  }, [onInfinite, loadingMore]);

  // FlatList mode
  if (renderItem) {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor ?? ((_, i) => i.toString())}
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
            backgroundColor,
            paddingBottom: Math.max(70 + 16, insets.bottom + 16),
          },
          contentContainerStyle,
        ]}
        className="flex-1"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing ?? internalRefreshing}
              onRefresh={handleRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
              progressBackgroundColor="#ffffff"
            />
          ) : undefined
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={ListHeaderComponent ?? undefined}
        ListFooterComponent={
          ListFooterComponent ??
          (onInfinite && loadingMore ? (
            <View className="py-5 items-center justify-center">
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
          ) : undefined)
        }
        ListEmptyComponent={ListEmptyComponent ?? undefined}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={10}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    );
  }

  // Regular View mode
  return (
    <View
      style={[
        {
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 8,
          backgroundColor,
          paddingBottom: Math.max(70 + 16, insets.bottom + 16),
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );
}

export default Screen;