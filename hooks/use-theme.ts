/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { colors, radius, spacing, typography, type Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo } from "react";

export function useTheme() {
  const theme = useColorScheme() ?? "light";

  // Memoize the entire theme object to prevent unnecessary re-renders
  return useMemo(() => ({
    colors: colors[theme] as Colors,
    spacing,
    typography,
    radius
  }), [theme]);
}