
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useRef, type FC, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode; // main content slot
  footer?: ReactNode; // buttons/actions slot
  position?: "bottom" | "center"; // NEW
  dismissOnOverlayPress?: boolean; // NEW
}

export const Dialog: FC<DialogProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  position = "bottom",
  dismissOnOverlayPress = true,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const { colors, spacing } = useTheme();


  // Animate modal slide
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
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableWithoutFeedback
        onPress={dismissOnOverlayPress ? onClose : undefined}
      >
        <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          {/* Stop touches from propagating */}
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                position === "center"
                  ? styles.centeredContainer
                  : { transform: [{ translateY: slideAnim }] },
                { backgroundColor: colors.background, padding: spacing.md },
              ]}
              importantForAccessibility="yes"
            >
              {/* Title */}
              {title ? (
                <Text
                  style={[styles.title, { color: colors.text }]}
                  accessibilityLabel="Modal title"
                >
                  {title}
                </Text>
              ) : null}

              {/* Main Content */}
              <View style={styles.content}>{children}</View>

              {/* Footer */}
              {footer ? (
                <View style={[styles.footer, { marginTop: spacing.md, gap: spacing.md }]}>
                  {footer}
                </View>
              ) : null}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: 200,
  },
  centeredContainer: {
    marginHorizontal: 24,
    borderRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
    transform: [{ translateY: 0 }], // no slide from bottom
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
