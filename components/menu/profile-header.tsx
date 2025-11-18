import { useTheme } from "@/hooks/use-theme";
import { User } from "@/types/auth";
import { serverStorage } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

type ProfileHeaderProps = {
  user?: User | null;
};

export const ProfileHeader = memo(({ user }: ProfileHeaderProps) => {
  const { colors, spacing, typography, radius } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      alignItems: "center",
      marginBottom: spacing.md,
      // Enhanced shadow for better depth
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: colors.primary,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + "20",
      borderWidth: 4,
      borderColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.card,
    },
    name: {
      fontSize: Number(typography.heading.fontSize) + 2,
      fontWeight: "700",
      color: colors.text,
      marginBottom: spacing.xs,
      textAlign: "center",
    },
    email: {
      fontSize: typography.body.fontSize,
      color: colors.muted,
      textAlign: "center",
    },
  });

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || "User";

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {user?.avatar ? (
          <Image
            source={{ uri: serverStorage(user.avatar) }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons
              name="person"
              size={50}
              color={colors.primary}
            />
          </View>
        )}
        <View style={styles.avatarBadge}>
          <Ionicons
            name="camera"
            size={16}
            color={colors.card}
          />
        </View>
      </View>
      
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{user?.email}</Text>
    </View>
  );
});

ProfileHeader.displayName = "ProfileHeader";