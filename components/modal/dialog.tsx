// components/modal/dialog.tsx
/**
 * Dialog/Modal Component with Bottom Sheet Animation
 * Pure NativeWind styling - no theme hooks
 */

import { useEffect, useRef, type FC, type ReactNode } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
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
}

export const Dialog: FC<DialogProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  position = 'bottom',
  dismissOnOverlayPress = true,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={dismissOnOverlayPress ? onClose : undefined}>
        <View className="flex-1 justify-end bg-black/50">
          {/* Stop touches from propagating */}
          <TouchableWithoutFeedback>
            <Animated.View
              className={`bg-background p-4 min-h-[200px] ${
                position === 'center'
                  ? 'mx-6 rounded-2xl self-center justify-center'
                  : 'rounded-t-2xl'
              }`}
              style={
                position === 'bottom'
                  ? { transform: [{ translateY: slideAnim }] }
                  : undefined
              }
              importantForAccessibility="yes"
            >
              {/* Title */}
              {title && (
                <Text
                  className="text-lg font-bold text-gray-800 mb-3 text-center"
                  accessibilityLabel="Modal title"
                >
                  {title}
                </Text>
              )}

              {/* Main Content */}
              <View className="flex-1">{children}</View>

              {/* Footer */}
              {footer && (
                <View className="flex-row justify-end mt-4 gap-4">{footer}</View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
