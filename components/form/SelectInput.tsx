// components/form/SelectInput.tsx
/**
 * Select Input Component with Modal Dropdown
 * Pure NativeWind styling - no theme hooks
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

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

  const measureInput = () => {
    if (inputRef.current) {
      inputRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setInputLayout({ x, y, width, height });
        }
      );
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
    outputRange: ['0deg', '180deg'],
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
      ...(showAbove ? { bottom: dropdownBottom } : { top: dropdownTop }),
    };
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={containerStyle}>
          {/* Label */}
          {label && (
            <View className="flex-row items-center">
              <Text
                className={cn('text-base font-normal text-gray-800 mb-1', labelStyle)}
              >
                {label}
              </Text>
              {required && <Text className="text-error-600 ml-1">*</Text>}
            </View>
          )}

          {/* Input Trigger */}
          <TouchableOpacity
            ref={inputRef}
            onPress={handleOpen}
            className={cn(
              'border border-gray-300 rounded-lg py-2.5 px-3 bg-white min-h-[40px] flex-row items-center justify-between',
              error && 'border-error-600',
              inputStyle
            )}
            activeOpacity={0.7}
          >
            <View className="flex-1 mr-2">
              <Text
                className={cn(
                  'text-base',
                  value ? 'text-gray-800' : 'text-gray-400'
                )}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {value
                  ? options.find((opt) => opt.value === value)?.label
                  : placeholder || 'Select an option'}
              </Text>
            </View>

            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
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
              <View className="flex-1 bg-transparent">
                <Animated.View
                  className="absolute bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg"
                  style={[
                    getDropdownStyle(),
                    {
                      opacity: opacityAnim,
                      transform: [{ translateY: translateYAnim }],
                    },
                  ]}
                >
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {options.map((item, index) => (
                      <TouchableOpacity
                        key={item.value}
                        className={cn(
                          'py-3 px-4 border-b border-gray-200',
                          index === options.length - 1 && 'border-b-0'
                        )}
                        onPress={() => {
                          onChange(item.value);
                          handleClose();
                        }}
                      >
                        <Text className="text-base text-gray-800">{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Helper Text */}
          {!error && helperText && (
            <Text className={cn('text-sm text-gray-500 mt-1', helperTextStyle)}>
              {helperText}
            </Text>
          )}

          {/* Error Text */}
          {error && (
            <Text className={cn('text-sm text-error-600 mt-1', errorTextStyle)}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

export default SelectInput;