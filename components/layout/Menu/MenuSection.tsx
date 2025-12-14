import { useTheme } from "@/hooks/use-theme";
import { memo, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type MenuSectionProps = {
  title?: string;
  children: ReactNode;
};

export const MenuSection = memo(({ title, children }: MenuSectionProps) => {
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.caption.fontSize,
      fontWeight: "600",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: spacing.md,
      marginLeft: spacing.xs,
    },
    content: {
      backgroundColor: colors.card,
      borderRadius: typography.body.fontSize,
      padding: spacing.sm,
      gap: spacing.sm
    },
  });

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
});

MenuSection.displayName = "MenuSection";