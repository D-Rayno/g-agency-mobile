// components/info.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Button from '@/components/button';
import { useTheme } from '@/hooks/use-theme';

export interface InfoProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  icon?: {
    family: 'Feather';
    name: string;
    size?: number;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  actionButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  style?: any;
  visible?: boolean;
  animationDuration?: number;
}

export default function Info({
  type = 'info',
  title,
  message,
  icon,
  dismissible = false,
  onDismiss,
  actionButton,
  style,
  visible = true,
  animationDuration = 300,
}: InfoProps) {
  const { colors, spacing, typography, radius } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation effect
  useEffect(() => {
    if (visible) {
      // Enter animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(handleAnimationComplete);
    }
  }, [visible, slideAnim, fadeAnim, animationDuration]);

  const handleDismiss = () => {
    if (onDismiss) {
      // Trigger exit animation then call onDismiss
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
        onDismiss();
      });
    }
  };

  // Get theme colors based on type
  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          background: colors.success + '15',
          border: colors.success + '30',
          text: colors.success,
          icon: colors.success,
        };
      case 'warning':
        return {
          background: colors.warning + '15',
          border: colors.warning + '30',
          text: colors.warning,
          icon: colors.warning,
        };
      case 'error':
        return {
          background: colors.danger + '15',
          border: colors.danger + '30',
          text: colors.danger,
          icon: colors.danger,
        };
      case 'info':
      default:
        return {
          background: colors.info + '15',
          border: colors.info + '30',
          text: colors.info,
          icon: colors.info,
        };
    }
  };

  // Get default icon based on type
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return { family: 'Feather' as const, name: 'check-circle', size: 20 };
      case 'warning':
        return { family: 'Feather' as const, name: 'alert-triangle', size: 20 };
      case 'error':
        return { family: 'Feather' as const, name: 'alert-circle', size: 20 };
      case 'info':
      default:
        return { family: 'Feather' as const, name: 'info', size: 20 };
    }
  };

  const typeColors = getTypeColors();
  const displayIcon = icon || getDefaultIcon();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: typeColors.background,
      borderColor: typeColors.border,
      borderWidth: 1,
      borderRadius: radius.sm,
      padding: spacing.md,
      marginVertical: spacing.xs,
      ...style,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: title ? spacing.xs : 0,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    iconContainer: {
      marginRight: spacing.sm,
      marginTop: 2, // Align with text baseline
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: typography.body.fontSize,
      fontWeight: '600',
      color: typeColors.text,
      marginBottom: spacing.xs,
    },
    message: {
      fontSize: typography.caption.fontSize,
      color: typeColors.text,
      lineHeight: 18,
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      marginLeft: spacing.sm,
    },
    dismissButton: {
      padding: spacing.xs / 2,
      borderRadius: radius.xs,
      backgroundColor: typeColors.text + '10',
    },
    actionButtonContainer: {
      marginTop: spacing.sm,
      alignItems: 'flex-start',
    },
  });

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  // Track if component should render during animation
  const [shouldRender, setShouldRender] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
    }
  }, [visible]);

  const handleAnimationComplete = () => {
    if (!visible) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.leftContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Feather
              name={displayIcon.name as any}
              size={displayIcon.size || 20}
              color={typeColors.icon}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {dismissible && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={16} color={typeColors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Action Button */}
      {actionButton && (
        <View style={styles.actionButtonContainer}>
          <Button
            title={actionButton.title}
            onPress={actionButton.onPress}
            variant={actionButton.variant || 'secondary'}
            compact
            soft
          />
        </View>
      )}
    </Animated.View>
  );
}