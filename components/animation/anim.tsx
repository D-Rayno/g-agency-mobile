import LottieView, { AnimationObject } from "lottie-react-native";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View, ViewStyle } from "react-native";

export interface AnimRef {
  play: (startFrame?: number, endFrame?: number) => void;
  pause: () => void;
  reset: () => void;
  resume: () => void;
  goToFrame: (frame: number, isPlaying?: boolean) => void;
  goToProgress: (progress: number, isPlaying?: boolean) => void;
}

export interface AnimProps {
  source?: string | AnimationObject | { uri: string }; // JSON animation file
  style?: ViewStyle;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  progress?: number;
  onAnimationFinish?: (isCancelled: boolean) => void;
  onAnimationLoaded?: () => void;
  colorFilters?: Array<{
    keypath: string;
    color: string;
  }>;
  resizeMode?: "contain" | "cover" | "center";
}

const ANIMATIONS = {
  "show-password": () => require("@/assets/animations/show-password.json"),
  success: () => require("@/assets/animations/success.json"),
  "one-time-password": () =>
    require("@/assets/animations/one-time-password.json"),
  "set-password": () => require("@/assets/animations/set-password.json"),
  lock: () => require("@/assets/animations/lock.json"),
  email: () => require("@/assets/animations/email.json"),
  notification: () => require("@/assets/animations/notification.json"),
} as const;

const Anim = forwardRef<AnimRef, AnimProps>(
  (
    {
      source,
      style,
      width = 24,
      height = 24,
      autoPlay = true,
      loop = false,
      speed = 1,
      progress,
      onAnimationFinish,
      onAnimationLoaded,
      colorFilters,
      resizeMode = "contain",
    },
    ref
  ) => {
    const lottieRef = useRef<LottieView>(null);
    const animationSource =
      typeof source === "string" && Object.keys(ANIMATIONS).includes(source)
        ? ANIMATIONS[source as keyof typeof ANIMATIONS]()
        : source;

    useImperativeHandle(ref, () => ({
      play: (startFrame?: number, endFrame?: number) => {
        if (startFrame !== undefined && endFrame !== undefined) {
          lottieRef.current?.play(startFrame, endFrame);
        } else {
          lottieRef.current?.play();
        }
      },
      pause: () => {
        lottieRef.current?.pause();
      },
      reset: () => {
        lottieRef.current?.reset();
      },
      resume: () => {
        lottieRef.current?.resume();
      },
      goToFrame: (frame: number, isPlaying = false) => {
        lottieRef.current?.play(frame, frame);
        if (!isPlaying) {
          lottieRef.current?.pause();
        }
      },
      goToProgress: (progress: number, isPlaying = false) => {
        lottieRef.current?.play();
        lottieRef.current?.pause();
        // Note: lottie-react-native might not have direct progress control
        // You might need to calculate frame based on total frames
      },
    }));

    const containerStyle: ViewStyle = {
      width,
      height,
      ...style,
    };

    return (
      <View style={containerStyle}>
        <LottieView
          ref={lottieRef}
          source={animationSource}
          style={{ flex: 1 }}
          autoPlay={autoPlay}
          loop={loop}
          speed={speed}
          progress={progress}
          onAnimationFinish={onAnimationFinish}
          colorFilters={colorFilters}
          resizeMode={resizeMode}
        />
      </View>
    );
  }
);

Anim.displayName = "Anim";

export default Anim;
