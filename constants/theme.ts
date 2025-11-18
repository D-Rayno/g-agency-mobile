/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import type { TextStyle } from "react-native";
import { Platform } from "react-native";

export type Typography = {
  body: TextStyle;
  heading: TextStyle;
  subheading: TextStyle;
  caption: TextStyle;
};

export type Colors = {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  muted: string;
  light: string;
  dark: string;
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  card: string;
  border: string;
  notification: string;
  placeholder: string;
};

export type Sizes = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full?: number;
  card?: number;
}



// Base palette from your logo
export const baseColors = {
  primary: "#1F6F61", // teal
  secondary: "#F37021", // orange
  tertiary: "#FCD434", // yellow
  accent: "#CCCCCC", // light gray
  success: "#10B981", // emerald
  danger: "#EF4444", // red
  warning: "#FBBF24", // yellow
  info: "#3B82F6", // blue
  muted: "#6B7280", // gray
  light: "#fafafa",
  dark: "#11181C"
};

export const colors: {
  light: Colors;
  dark: Colors;
} = {
  light: {
    text: baseColors.dark,
    background: baseColors.light,
    tint: baseColors.primary,
    icon: baseColors.muted,
    tabIconDefault: baseColors.muted,
    tabIconSelected: baseColors.primary,
    card: "#f8f8f8f8",
    border: "#E5E7EB",
    notification: baseColors.secondary,
    placeholder: baseColors.accent, // gray-400
    ...baseColors,
  },
  dark: {
    text: "#ECEDEE",
    background: "#061614ff",
    tint: baseColors.light,
    icon: baseColors.accent,
    tabIconDefault: baseColors.accent,
    tabIconSelected: baseColors.light,
    card: "#0a2522ff",
    border: "#334155",
    notification: baseColors.secondary,
    placeholder: baseColors.muted, // slate-600
    ...baseColors,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Extra design tokens
export const spacing: Sizes = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius: Sizes = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 20,
  xl: 40,
  full: 999,
  card: 16
};

export const typography: Typography = {
  heading: { fontSize: 24, fontWeight: "700" },
  subheading: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 14, fontWeight: "400" },
  caption: { fontSize: 12, fontWeight: "300" },
};
