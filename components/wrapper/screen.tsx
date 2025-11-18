// components/wrapper/screen.tsx (Fixed version)
import { useTheme } from "@/hooks/use-theme";
import {
  useCallback,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  showsVerticalScrollIndicator?: boolean;
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
  showsVerticalScrollIndicator = true,
}: ScreenProps<T>) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const {
    colors: { primary, background },
    spacing: { md },
  } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: md,
      backgroundColor: background,
      // Add bottom padding to account for tab bar (70px) + safe area
      paddingBottom: Math.max(70 + md, insets.bottom + md),
    },
    listContainer: {
      flexGrow: 1,
    },
    footer: {
      paddingVertical: md,
      alignItems: "center",
      justifyContent: "center",
    },
  });

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
    // Prevent multiple calls when already loading
    if (loadingMore || !onInfinite) return;
    onInfinite();
  }, [onInfinite, loadingMore]);

  if (renderItem) {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor ?? ((_, i) => i.toString())}
        contentContainerStyle={[styles.container, contentContainerStyle]}
        style={styles.listContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing ?? internalRefreshing}
              onRefresh={handleRefresh}
              colors={[primary]}
              tintColor={primary}
            />
          ) : undefined
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={ListHeaderComponent ?? undefined}
        ListFooterComponent={
          ListFooterComponent ??
          (onInfinite && loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={primary} />
            </View>
          ) : undefined)
        }
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        // Optimize performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        // Prevent content from jumping on refresh
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    );
  }

  return (
    <View style={[styles.container, contentContainerStyle]}>{children}</View>
  );
}