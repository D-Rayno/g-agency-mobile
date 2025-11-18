import { useTheme } from "@/hooks/use-theme";
import { merge } from "lodash";
import type { FC, ReactNode } from "react";
import { memo, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

type CardProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  styles?: {
    card?: ViewStyle;
    header?: ViewStyle;
    body?: ViewStyle;
    footer?: ViewStyle;
  };
  touchable?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
};

const Card: FC<CardProps> = memo(
  ({
    header,
    children,
    footer,
    styles,
    touchable = false,
    onPress,
    activeOpacity = 0.7,
    disabled = false,
  }) => {
    const { colors, spacing, radius } = useTheme();

    const defaultStyles = useMemo(
      () => ({
        card: {
          backgroundColor: colors.card,
          borderRadius: radius.card,
          shadowColor: colors.dark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
          overflow: "hidden" as const,
        },
        header: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.placeholder + "30",
        },
        body: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          gap: spacing.md,
        },
        footer: {
          borderTopWidth: 1,
          borderTopColor: colors.placeholder + "30",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
        },
      }),
      [colors.card, colors.dark, colors.placeholder, spacing.md, radius.card]
    );

    const _styles = useMemo(
      () => StyleSheet.create(merge({}, defaultStyles, styles || {})),
      [defaultStyles, styles]
    );

    const content = (
      <>
        {header && <View style={_styles.header}>{header}</View>}
        <View style={_styles.body}>{children}</View>
        {footer && <View style={_styles.footer}>{footer}</View>}
      </>
    );

    if (touchable && onPress) {
      return (
        <TouchableOpacity
          style={_styles.card}
          onPress={onPress}
          activeOpacity={activeOpacity}
          disabled={disabled}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return <View style={_styles.card}>{content}</View>;
  }
);

Card.displayName = "Card";

export default Card;
