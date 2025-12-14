import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MenuItemProps = {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  showArrow?: boolean;
};

export const MenuItem = memo(({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  variant = "default", 
  disabled = false,
  showArrow = true 
}: MenuItemProps) => {
  const { colors, spacing, typography, radius } = useTheme();

  const isDanger = variant === "danger";
  const iconColor = isDanger ? colors.danger : colors.primary;
  const titleColor = isDanger ? colors.danger : colors.text;
  const iconBgColor = isDanger ? colors.danger + "15" : colors.primary + "15";

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      // Subtle shadow for depth
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: radius.sm + 2,
      backgroundColor: iconBgColor,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: typography.body.fontSize,
      fontWeight: "600",
      color: titleColor,
      marginBottom: subtitle ? spacing.xs / 2 : 0,
    },
    subtitle: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      lineHeight: 16,
    },
    arrow: {
      marginLeft: spacing.sm,
      opacity: 0.6,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon as any}
          size={22}
          color={iconColor}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.muted}
          style={styles.arrow}
        />
      )}
    </TouchableOpacity>
  );
});

MenuItem.displayName = "MenuItem";