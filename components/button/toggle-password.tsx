import { useTheme } from "@/hooks/use-theme";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import Anim, { AnimRef } from "../animation/anim";

// Import your animation

export interface PasswordToggleButtonProps
  extends Omit<TouchableOpacityProps, "onPress"> {
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
  size?: number;
  animationSpeed?: number;
}

const PasswordToggleButton: React.FC<PasswordToggleButtonProps> = ({
  isVisible,
  onToggle,
  size = 24,
  animationSpeed = 1,
  style,
  ...touchableProps
}) => {
  const lottieRef = useRef<AnimRef>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { spacing, radius } = useTheme();
  const handlePress = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newVisibleState = !isVisible;

    // Based on your description:
    // - Frame 0: visible
    // - Frame 15: not visible (middle)
    // - Frame 30: visible

    if (newVisibleState) {
      // Going from hidden to visible: play from frame 15 to 30
      lottieRef.current?.play(15, 30);
    } else {
      // Going from visible to hidden: play from frame 0 to 15
      lottieRef.current?.play(0, 15);
    }

    onToggle(newVisibleState);

    // Reset animation state after animation duration
    setTimeout(() => {
      setIsAnimating(false);
    }, ((15 / 30) * 1000) / animationSpeed); // 15 frames at 30fps
  }, [isVisible, onToggle, animationSpeed, isAnimating]);

  const handleAnimationFinish = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Set initial frame based on current state
  useEffect(() => {
    if (lottieRef.current && !isAnimating) {
      if (isVisible) {
        lottieRef.current.goToFrame(30, false); // Visible state
      } else {
        lottieRef.current.goToFrame(15, false); // Hidden state
      }
    }
  }, [isVisible, isAnimating]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[style]}
      disabled={isAnimating}
      {...touchableProps}
    >
      <Anim
        ref={lottieRef}
        source="show-password"
        width={size}
        height={size}
        autoPlay={false}
        loop={false}
        speed={animationSpeed}
        onAnimationFinish={handleAnimationFinish}
      />
    </TouchableOpacity>
  );
};

export default PasswordToggleButton;
