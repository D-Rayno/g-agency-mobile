// constants/theme.ts
/**
 * Modern theme constants for consistent styling across the app
 * Color Palette: Professional Emerald + Warm Orange
 */

export const PALETTE = {
  // Primary Colors (Professional Emerald)
  emerald50: '#ECFDF5',
  emerald100: '#D1FAE5',
  emerald200: '#A7F3D0',
  emerald300: '#6EE7B7',
  emerald400: '#34D399',
  emerald500: '#10B981',    // Primary
  emerald600: '#059669',    // Primary Dark
  emerald700: '#047857',
  emerald800: '#065F46',
  emerald900: '#064E3B',

  // Secondary Colors (Warm Orange)
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange200: '#FED7AA',
  orange300: '#FDBA74',
  orange400: '#FB923C',
  orange500: '#F97316',     // Secondary
  orange600: '#EA580C',     // Secondary Dark
  orange700: '#C2410C',
  orange800: '#9A3412',
  orange900: '#7C2D12',

  // Semantic Colors
  red500: '#EF4444',
  amber500: '#F59E0B',
  blue500: '#3B82F6',

  // Neutrals (Gray Scale)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const FONT_SIZE = {
  '2xs': 10,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const FONT_WEIGHT = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Semantic Colors for Light Theme
const lightColors = {
  // Backgrounds
  background: PALETTE.gray50,
  surface: PALETTE.white,
  card: PALETTE.white,

  // Text
  text: PALETTE.gray900,
  textSecondary: PALETTE.gray600,
  textTertiary: PALETTE.gray500,

  // Brand
  primary: PALETTE.emerald600,
  primaryLight: PALETTE.emerald500,
  primaryDark: PALETTE.emerald700,
  secondary: PALETTE.orange500,
  secondaryLight: PALETTE.orange400,
  secondaryDark: PALETTE.orange600,

  // Semantic
  success: PALETTE.emerald500,
  warning: PALETTE.amber500,
  danger: PALETTE.red500,
  info: PALETTE.blue500,

  // UI Elements
  border: PALETTE.gray200,
  borderLight: PALETTE.gray100,
  muted: PALETTE.gray400,
  disabled: PALETTE.gray300,

  // Interactive
  hover: PALETTE.gray100,
  active: PALETTE.gray200,
  focus: PALETTE.emerald100,
};

// Semantic Colors for Dark Theme
const darkColors = {
  // Backgrounds
  background: PALETTE.gray900,
  surface: PALETTE.gray800,
  card: PALETTE.gray800,

  // Text
  text: PALETTE.white,
  textSecondary: PALETTE.gray400,
  textTertiary: PALETTE.gray500,

  // Brand
  primary: PALETTE.emerald500,
  primaryLight: PALETTE.emerald400,
  primaryDark: PALETTE.emerald600,
  secondary: PALETTE.orange500,
  secondaryLight: PALETTE.orange400,
  secondaryDark: PALETTE.orange600,

  // Semantic
  success: PALETTE.emerald500,
  warning: PALETTE.amber500,
  danger: PALETTE.red500,
  info: PALETTE.blue500,

  // UI Elements
  border: PALETTE.gray700,
  borderLight: PALETTE.gray600,
  muted: PALETTE.gray600,
  disabled: PALETTE.gray700,

  // Interactive
  hover: PALETTE.gray700,
  active: PALETTE.gray600,
  focus: PALETTE.emerald900,
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};

export type Colors = typeof lightColors;

// Aliases for useTheme
export const spacing = SPACING;
export const radius = BORDER_RADIUS;

export const typography = {
  h1: { fontSize: FONT_SIZE['4xl'], fontWeight: FONT_WEIGHT.bold },
  h2: { fontSize: FONT_SIZE['3xl'], fontWeight: FONT_WEIGHT.bold },
  h3: { fontSize: FONT_SIZE['2xl'], fontWeight: FONT_WEIGHT.semibold },
  h4: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.semibold },
  body: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.normal },
  bodyLarge: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.normal },
  caption: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.normal },
  small: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.normal },
  button: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold },
};
