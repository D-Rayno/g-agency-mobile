// components/SelectInput.tsx
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Option = {
  label: string;
  value: string | number;
};

interface SelectInputProps {
  control: any;
  name: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  rules?: object;
  containerStyle?: object;
  inputStyle?: object;
  labelStyle?: object;
  helperTextStyle?: object;
  errorTextStyle?: object;
  required?: boolean;
  options: Option[];
  maxDropdownHeight?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SelectInput: FC<SelectInputProps> = ({
  control,
  name,
  label,
  helperText,
  placeholder,
  rules = {},
  containerStyle,
  inputStyle,
  labelStyle,
  helperTextStyle,
  errorTextStyle,
  required,
  options,
  maxDropdownHeight = 200,
}) => {
  const { colors, typography, spacing } = useTheme();
  const [open, setOpen] = useState(false);
  const [inputLayout, setInputLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const inputRef = useRef<any>(null);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-10)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    label: {
      marginBottom: spacing.xs,
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: typography.body.fontSize,
      color: colors.text,
      backgroundColor: colors.card,
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    errorInput: {
      borderColor: colors.danger,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    dropdownText: {
      fontSize: typography.body.fontSize,
      color: colors.text,
    },
    helperText: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      marginTop: 4,
    },
    errorText: {
      color: colors.danger,
      marginTop: 4,
      fontSize: typography.caption.fontSize,
    },
    required: {
      color: colors.danger,
      marginLeft: 4,
    },
  });

  const measureInput = () => {
    if (inputRef.current) {
      inputRef.current.measureInWindow((x:number, y:number, width:number, height:number) => {
        setInputLayout({ x, y, width, height });
      });
    }
  };

  const handleOpen = () => {
    measureInput();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Calculate dropdown position
  const getDropdownStyle = () => {
    const dropdownTop = inputLayout.y + inputLayout.height + 4;
    const dropdownBottom = screenHeight - inputLayout.y + 4;
    
    // Check if dropdown should appear above or below the input
    const showAbove = dropdownTop + maxDropdownHeight > screenHeight - 50;
    
    return {
      left: inputLayout.x,
      width: inputLayout.width,
      maxHeight: maxDropdownHeight,
      ...(showAbove 
        ? { bottom: dropdownBottom } 
        : { top: dropdownTop }
      ),
    };
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={containerStyle}>
          {label && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.label, labelStyle]}>{label}</Text>
              {required && <Text style={styles.required}>*</Text>}
            </View>
          )}

          <TouchableOpacity
            ref={inputRef}
            onPress={handleOpen}
            style={[styles.input, error && styles.errorInput, inputStyle]}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{
                  color: value ? colors.text : colors.muted,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {value
                  ? options.find((opt) => opt.value === value)?.label
                  : placeholder || "Select an option"}
              </Text>
            </View>

            <Animated.View
              style={{ transform: [{ rotate: rotateInterpolate }] }}
            >
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.muted}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Modal Dropdown */}
          <Modal
            visible={open}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
          >
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={styles.modalOverlay}>
                <Animated.View
                  style={[
                    styles.dropdown,
                    getDropdownStyle(),
                    {
                      opacity: opacityAnim,
                      transform: [{ translateY: translateYAnim }],
                    },
                  ]}
                >
                  <ScrollView 
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    {options.map((item, index) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.dropdownItem,
                          // Remove border from last item
                          index === options.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          onChange(item.value);
                          handleClose();
                        }}
                      >
                        <Text style={styles.dropdownText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {!error && helperText && (
            <Text style={[styles.helperText, helperTextStyle]}>
              {helperText}
            </Text>
          )}
          {error && (
            <Text style={[styles.errorText, errorTextStyle]}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};