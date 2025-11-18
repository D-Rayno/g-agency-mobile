// app/(admin)/(tabs)/index.tsx - Admin Dashboard with Proper API Integration
import { useTheme } from "@/hooks/use-theme";
import { adminApi } from "@/services/admin-api";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Stats {
  events: {
    total: number;
    upcoming: number;
    ongoing: number;
    finished: number;
  };
  users: {
    total: number;
    verified: number;
    blocked: number;
    active: number;
  };
  registrations: {
    total: number;
    confirmed: number;
    attended: number;
    canceled: number;
    recent: number;
  };
}

export default function AdminDashboard() {
  const { colors, spacing, typography } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      // Load all stats in parallel
      const [eventsStats, usersStats, regsStats] = await Promise.all([
        adminApi.getEventStats(),
        adminApi.getUserStats(),
        adminApi.getRegistrationStats(),
      ]);

      setStats({
        events: eventsStats.data!,
        users: usersStats.data!,
        registrations: regsStats.data!,
      });
    } catch (err: any) {
      console.error("Failed to load stats:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  // Load stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats(true);
  }, [loadStats]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.card,
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: typography.heading.fontSize,
      fontWeight: typography.heading.fontWeight as any,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
    },
    scrollContent: {
      padding: spacing.md,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.subheading.fontSize,
      fontWeight: typography.subheading.fontWeight as any,
      color: colors.text,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      minWidth: "47%",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: spacing.xs / 2,
    },
    statLabel: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.body.fontSize,
      color: colors.muted,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    errorText: {
      fontSize: typography.body.fontSize,
      color: colors.danger,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.light,
      fontSize: typography.body.fontSize,
      fontWeight: "600",
    },
  });

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Admin Overview</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Admin Overview</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadStats()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Real-time statistics</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Events Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <MaterialIcons name="event" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats?.events.total || 0}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.info + "20" },
                ]}
              >
                <MaterialIcons
                  name="event-available"
                  size={24}
                  color={colors.info}
                />
              </View>
              <Text style={styles.statValue}>
                {stats?.events.upcoming || 0}
              </Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.warning + "20" },
                ]}
              >
                <Ionicons name="time" size={24} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{stats?.events.ongoing || 0}</Text>
              <Text style={styles.statLabel}>Ongoing</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={colors.success}
                />
              </View>
              <Text style={styles.statValue}>
                {stats?.events.finished || 0}
              </Text>
              <Text style={styles.statLabel}>Finished</Text>
            </View>
          </View>
        </View>

        {/* Users Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons name="people" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats?.users.total || 0}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <MaterialIcons
                  name="verified"
                  size={24}
                  color={colors.success}
                />
              </View>
              <Text style={styles.statValue}>{stats?.users.verified || 0}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.info + "20" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.info}
                />
              </View>
              <Text style={styles.statValue}>{stats?.users.active || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.danger + "20" },
                ]}
              >
                <MaterialIcons name="block" size={24} color={colors.danger} />
              </View>
              <Text style={styles.statValue}>{stats?.users.blocked || 0}</Text>
              <Text style={styles.statLabel}>Blocked</Text>
            </View>
          </View>
        </View>

        {/* Registrations Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registrations</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <MaterialIcons
                  name="confirmation-number"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.statValue}>
                {stats?.registrations.total || 0}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.info + "20" },
                ]}
              >
                <MaterialIcons
                  name="event-available"
                  size={24}
                  color={colors.info}
                />
              </View>
              <Text style={styles.statValue}>
                {stats?.registrations.confirmed || 0}
              </Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <MaterialIcons
                  name="how-to-reg"
                  size={24}
                  color={colors.success}
                />
              </View>
              <Text style={styles.statValue}>
                {stats?.registrations.attended || 0}
              </Text>
              <Text style={styles.statLabel}>Attended</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.warning + "20" },
                ]}
              >
                <MaterialIcons
                  name="trending-up"
                  size={24}
                  color={colors.warning}
                />
              </View>
              <Text style={styles.statValue}>
                {stats?.registrations.recent || 0}
              </Text>
              <Text style={styles.statLabel}>Recent (7d)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
