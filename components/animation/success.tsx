import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Anim, { AnimRef } from './anim';

// Import your success animation
const successAnimation = require('../assets/animations/success.json');

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface SuccessFullScreenProps {
  visible: boolean;
  onDismiss: () => void;
  animationSize?: number;
  animationSpeed?: number;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  overlayColor?: string;
  allowTapToDismiss?: boolean;
}

const SuccessFullScreen: React.FC<SuccessFullScreenProps> = ({
  visible,
  onDismiss,
  animationSize = 200,
  animationSpeed = 1,
  autoDismiss = true,
  autoDismissDelay = 2000,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  allowTapToDismiss = true,
}) => {
  const lottieRef = useRef<AnimRef>(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const dismissTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (visible) {
      setIsAnimationComplete(false);
      // Reset and play animation when modal becomes visible
      setTimeout(() => {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      }, 100);
    }
  }, [visible]);

  const handleAnimationFinish = (isCancelled: boolean) => {
    if (!isCancelled) {
      setIsAnimationComplete(true);
      
      if (autoDismiss) {
        dismissTimeoutRef.current = setTimeout(() => {
          onDismiss();
        }, autoDismissDelay);
      }
    }
  };

  const handleOverlayPress = () => {
    if (allowTapToDismiss && (isAnimationComplete || !autoDismiss)) {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
      onDismiss();
    }
  };

  const handleModalDismiss = () => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    setIsAnimationComplete(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      onDismiss={handleModalDismiss}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
          <View style={styles.container}>
            <Anim
              ref={lottieRef}
              source={successAnimation}
              width={animationSize}
              height={animationSize}
              autoPlay={false}
              loop={false}
              speed={animationSpeed}
              onAnimationFinish={handleAnimationFinish}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default SuccessFullScreen;