// components/card/gift.tsx - Fixed with translations
import { useI18n } from "@/context/i18n";
import { useTheme } from "@/hooks/use-theme";
import { getExpiryStatus, isGiftExpired } from "@/services/gift";
import { GiftData } from "@/types/gift";
import { serverStorage } from "@/utils";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GiftProps {
  gift: GiftData;
  onPress?: (gift: GiftData) => void;
  style?: any;
}

export const Gift: React.FC<GiftProps> = ({ gift, onPress, style }) => {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useI18n();

  // Calculate card size for square aspect ratio
  const screenWidth = Dimensions.get("window").width;
  const cardSize = (screenWidth - spacing.md * 3) / 2; // 3x spacing: left, right, gap

  const expired = isGiftExpired(gift.expiresAt);
  const expiryStatus = getExpiryStatus(gift.expiresAt);

  const styles = StyleSheet.create({
    container: {
      width: cardSize,
      height: cardSize,
    },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      overflow: "hidden",
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      position: "relative",
      opacity: expired ? 0.6 : 1,
    },
    logoContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    logoPlaceholder: {
      width: "70%",
      height: "70%",
      backgroundColor: colors.border,
      borderRadius: radius.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    percentageBadge: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      alignItems: "center",
    },
    percentageText: {
      fontSize: typography.subheading.fontSize,
      fontWeight: typography.subheading.fontWeight,
      color: colors.light,
      letterSpacing: 0.5,
      textAlign: "center"
    },
    companyText: {
      position: "absolute",
      top: spacing.sm,
      left: spacing.sm,
      right: spacing.sm,
      fontSize: typography.caption.fontSize,
      fontWeight: "600",
      color: colors.text,
      backgroundColor: colors.card + "E6",
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.xs,
      textAlign: "center",
    },
    expiryBadge: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.xs,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
    },
    expiryText: {
      fontSize: Number(typography.caption.fontSize) - 2,
      fontWeight: "600",
    },
    expiredOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    expiredText: {
      fontSize: typography.body.fontSize,
      fontWeight: "700",
      color: colors.light,
      textAlign: "center",
    },
  });

  const getExpiryBadgeStyle = () => {
    switch (expiryStatus.status) {
      case "expired":
        return {
          backgroundColor: colors.danger + "20",
          borderColor: colors.danger,
          borderWidth: 1,
        };
      case "expiring-soon":
        return {
          backgroundColor: colors.warning + "20",
          borderColor: colors.warning,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: colors.success + "20",
          borderColor: colors.success,
          borderWidth: 1,
        };
    }
  };

  const getExpiryTextColor = () => {
    switch (expiryStatus.status) {
      case "expired":
        return colors.danger;
      case "expiring-soon":
        return colors.warning;
      default:
        return colors.success;
    }
  };

  const handlePress = () => {
    if (onPress && !expired) {
      onPress(gift);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={expired ? 1 : 0.7}
      style={[styles.container, style]}
      disabled={expired}
    >
      <View style={styles.card}>
        {/* Company Name */}
        {gift.company && (
          <Text style={styles.companyText} numberOfLines={1}>
            {gift.company}
          </Text>
        )}

        {/* Expiry Badge */}
        {gift.expiresAt && (
          <View style={[styles.expiryBadge, getExpiryBadgeStyle()]}>
            <Feather name="clock" size={10} color={getExpiryTextColor()} />
            <Text style={[styles.expiryText, { color: getExpiryTextColor() }]}>
              {expiryStatus.message}
            </Text>
          </View>
        )}

        {/* Logo Container */}
        <View style={styles.logoContainer}>
          {gift.logo ? (
            <Image
              source={{ uri: serverStorage(gift.logo) }}
              style={styles.logo}
              onError={() => {
                console.log("Failed to load gift logo:", gift.logo);
              }}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Feather name="gift" size={24} color={colors.muted} />
            </View>
          )}
        </View>

        {/* Percentage Badge */}
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>
            {t('gifts.percentageOff', { percentage: gift.percentage })}
          </Text>
        </View>

        {/* Expired Overlay */}
        {expired && (
          <View style={styles.expiredOverlay}>
            <Text style={styles.expiredText}>{t('gifts.expired')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Gift;