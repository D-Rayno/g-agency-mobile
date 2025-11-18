// components/toast/toast-config.tsx - Themed Toast Configuration
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast, { ToastConfig } from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// Custom toast component with theme support
const CustomToast = ({ 
  type, 
  text1, 
  text2, 
  onPress,
  onClose 
}: {
  type: 'success' | 'error' | 'info' | 'warning';
  text1?: string;
  text2?: string;
  onPress?: () => void;
  onClose?: () => void;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = colors[colorScheme];

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: themeColors.success,
          iconName: 'check-circle',
          iconColor: themeColors.light,
          borderColor: themeColors.success,
        };
      case 'error':
        return {
          backgroundColor: themeColors.danger,
          iconName: 'x-circle',
          iconColor: themeColors.light,
          borderColor: themeColors.danger,
        };
      case 'warning':
        return {
          backgroundColor: themeColors.warning,
          iconName: 'alert-triangle',
          iconColor: themeColors.dark,
          borderColor: themeColors.warning,
        };
      case 'info':
      default:
        return {
          backgroundColor: themeColors.info,
          iconName: 'info',
          iconColor: themeColors.light,
          borderColor: themeColors.info,
        };
    }
  };

  const config = getToastConfig();

  const styles = StyleSheet.create({
    container: {
      height: 'auto',
      minHeight: 60,
      width: width - spacing.lg * 2,
      backgroundColor: themeColors.card,
      borderRadius: radius.md,
      borderLeftWidth: 4,
      borderLeftColor: config.borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.lg,
      shadowColor: themeColors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: config.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    contentContainer: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    title: {
      fontSize: typography.body.fontSize,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: text2 ? spacing.xs / 2 : 0,
    },
    message: {
      fontSize: typography.caption.fontSize,
      color: themeColors.muted,
      lineHeight: 16,
    },
    closeButton: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.iconContainer}>
        <Feather
          name={config.iconName as any}
          size={18}
          color={config.iconColor}
        />
      </View>

      <View style={styles.contentContainer}>
        {text1 && <Text style={styles.title} numberOfLines={2}>{text1}</Text>}
        {text2 && <Text style={styles.message} numberOfLines={3}>{text2}</Text>}
      </View>

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={16} color={themeColors.muted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Create the toast configuration
export const toastConfig: ToastConfig = {
  success: (props) => (
    <CustomToast
      type="success"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
  error: (props) => (
    <CustomToast
      type="error"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
  info: (props) => (
    <CustomToast
      type="info"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
  warning: (props) => (
    <CustomToast
      type="warning"
      text1={props.text1}
      text2={props.text2}
      onPress={props.onPress}
    />
  ),
  // You can also override the default ones if needed
  tomatoToast: ({ text1, props }) => (
    <View style={{ height: 60, width: '100%', backgroundColor: 'tomato' }}>
      <Text>{text1}</Text>
      <Text>{props.uuid}</Text>
    </View>
  ),
};

// Helper functions for showing toasts with translations
export const showSuccessToast = (title: string, message?: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
  });
};

export const showErrorToast = (title: string, message?: string) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
  });
};

export const showInfoToast = (title: string, message?: string) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
  });
};

export const showWarningToast = (title: string, message?: string) => {
  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
  });
};

export default toastConfig;