// components/Button.tsx
import type { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { FC } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";

// Type for supported icon families
type IconFamily = "MaterialIcons" | "Feather" | "Ionicons";

type IconProps = {
  family?: IconFamily;
  name: string;
  size?: number;
  color?: string;
};

type ButtonProps = {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: keyof Colors;
  style?: ViewStyle;
  textStyle?: TextStyle;
  link?: boolean;
  icon?: IconProps;
  iconPosition?: "left" | "right" | "top" | "bottom";
  compact?: boolean;
  soft?: boolean;
};

const getIconComponent = (family: IconFamily, props: any) => {
  switch (family) {
    case "MaterialIcons":
      return <MaterialIcons {...props} />;
    case "Feather":
      return <Feather {...props} />;
    case "Ionicons":
      return <Ionicons {...props} />;
    default:
      return <Feather {...props} />;
  }
};

const Button: FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
  link = false,
  icon,
  iconPosition = "left",
  compact = false,
  soft = false,
}) => {
  const { colors, typography } = useTheme();
  const colorMode = useColorScheme();
  const buttonColor = colors[variant] || colors.primary;

  const backgroundColor = link
    ? "transparent"
    : buttonColor + (soft ? "30" : ""); // Adding transparency for non-link buttons

  let textColor = link
    ? soft
      ? buttonColor + "30"
      : ""
    : soft
    ? buttonColor
    : colors.background;

  if (colorMode === "dark" && (link || !soft)) {
    textColor = colors.light; // links use normal text in dark mode
  }

  const renderIcon = () => {
    if (!icon) return null;

    return getIconComponent(icon.family || "Feather", {
      name: icon.name,
      size: icon.size || 24,
      color: icon.color || textColor,
    });
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor,
      padding: compact ? 8 : 15,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.5 : 1,
      flexDirection:
        iconPosition === "left" || iconPosition === "right" ? "row" : "column",
      gap: 8,
    },
    text: {
      fontWeight: "bold",
      textAlign: "center",
      color: textColor,
      fontSize: typography.body.fontSize,
    },
    compact: {
      width: 70,
      height: compact ? 70 : "auto",
    },
    iconLeft: {
      flexDirection: "row",
    },
    iconRight: {
      flexDirection: "row-reverse",
    },
    iconTop: {
      flexDirection: "column",
    },
    iconBottom: {
      flexDirection: "column-reverse",
    },
  });

  return (
    <TouchableOpacity
      style={[
        styles.button,
        compact && styles.compact,
        icon &&
          styles[
            `icon${
              iconPosition.charAt(0).toUpperCase() + iconPosition.slice(1)
            }` as "iconLeft" | "iconRight" | "iconTop" | "iconBottom"
          ],
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {renderIcon()}
      {title && <Text style={[styles.text, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
};

export default Button;
