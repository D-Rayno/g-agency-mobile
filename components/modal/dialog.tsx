// components/modal/dialog.tsx
/**
 * Enhanced Dialog/Modal Component with Bottom Sheet Animation
 * Modern design with smooth animations and refined styling
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, type FC, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  position?: 'bottom' | 'center';
  dismissOnOverlayPress?: boolean;
  showCloseButton?: boolean;
}

export const Dialog: FC<DialogProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  position = 'bottom',
  dismissOnOverlayPress = true,
  showCloseButton = true,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 6,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayAnim, scaleAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Animated Overlay */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: '#000',
          opacity: overlayAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        }}
      >
        <TouchableWithoutFeedback onPress={dismissOnOverlayPress ? onClose : undefined}>
          <View className="flex-1 justify-end">
            {/* Stop touches from propagating to overlay */}
            <TouchableWithoutFeedback>
              <Animated.View
                className={`bg-white min-h-[200px] ${
                  position === 'center'
                    ? 'mx-4 rounded-2xl self-center justify-center'
                    : 'rounded-t-3xl'
                }`}
                style={[
                  position === 'bottom'
                    ? { transform: [{ translateY: slideAnim }] }
                    : { transform: [{ scale: scaleAnim }] },
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 24,
                  },
                ]}
              >
                {/* Handle Bar (bottom sheet only) */}
                {position === 'bottom' && (
                  <View className="items-center pt-3 pb-2">
                    <View className="w-10 h-1 bg-gray-300 rounded-full" />
                  </View>
                )}

                <View className="px-6 py-4">
                  {/* Header with Title and Close Button */}
                  {(title || showCloseButton) && (
                    <View className="flex-row items-center justify-between mb-4">
                      <Text
                        className="text-xl font-bold text-gray-800 flex-1"
                        accessibilityLabel="Modal title"
                      >
                        {title || ' '}
                      </Text>
                      {showCloseButton && (
                        <Pressable
                          onPress={onClose}
                          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                        >
                          <Ionicons name="close" size={22} color="#6b7280" />
                        </Pressable>
                      )}
                    </View>
                  )}

                  {/* Main Content */}
                  <View className="flex-1">{children}</View>

                  {/* Footer */}
                  {footer && (
                    <View className="flex-row justify-end mt-6 gap-3">
                      {footer}
                    </View>
                  )}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
};

export default Dialog;