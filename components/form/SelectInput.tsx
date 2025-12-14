// components/form/SelectInput.tsx
/**
 * Enhanced Select Input Component with Modal Dropdown
 * Modern design with smooth animations and refined styling
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
  maxDropdownHeight = 240,
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
  const translateYAnim = useRef(new Animated.Value(-8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
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
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
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
          toValue: -8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const getDropdownStyle = () => {
    const dropdownTop = inputLayout.y + inputLayout.height + 8;
    const dropdownBottom = screenHeight - inputLayout.y + 8;
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
            <View className="flex-row items-center mb-2">
              <Text
                className={cn('text-sm font-semibold text-gray-700', labelStyle)}
              >
                {label}
              </Text>
              {required && <Text className="text-rose-600 ml-1">*</Text>}
            </View>
          )}

          {/* Input Trigger */}
          <TouchableOpacity
            ref={inputRef}
            onPress={handleOpen}
            className={cn(
              'border-2 border-gray-200 rounded-xl py-3 px-4 bg-white min-h-[48px] flex-row items-center justify-between',
              error && 'border-rose-500 bg-rose-50/30',
              inputStyle
            )}
            activeOpacity={0.7}
          >
            <View className="flex-1 mr-2">
              <Text
                className={cn(
                  'text-base font-medium',
                  value ? 'text-gray-900' : 'text-gray-400'
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
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
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
              <View className="flex-1 bg-black/20">
                <Animated.View
                  className="absolute bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-2xl"
                  style={[
                    getDropdownStyle(),
                    {
                      opacity: opacityAnim,
                      transform: [
                        { translateY: translateYAnim },
                        { scale: scaleAnim },
                      ],
                    },
                  ]}
                >
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {options.map((item, index) => {
                      const isSelected = item.value === value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          className={cn(
                            'py-3.5 px-4 flex-row items-center justify-between',
                            index !== options.length - 1 && 'border-b border-gray-100',
                            isSelected && 'bg-indigo-50'
                          )}
                          onPress={() => {
                            onChange(item.value);
                            handleClose();
                          }}
                        >
                          <Text className={cn(
                            'text-base',
                            isSelected ? 'text-indigo-700 font-semibold' : 'text-gray-900 font-medium'
                          )}>
                            {item.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Helper Text */}
          {!error && helperText && (
            <Text className={cn('text-sm text-gray-500 mt-2 font-normal', helperTextStyle)}>
              {helperText}
            </Text>
          )}

          {/* Error Text */}
          {error && (
            <View className="flex-row items-center mt-2 px-3 py-2 bg-rose-50 rounded-lg border border-rose-200">
              <Ionicons name="alert-circle" size={16} color="#f43f5e" />
              <Text className={cn('text-sm text-rose-700 ml-2 font-medium flex-1', errorTextStyle)}>
                {error.message}
              </Text>
            </View>
          )}
        </View>
      )}
    />
  );
};

export default SelectInput;