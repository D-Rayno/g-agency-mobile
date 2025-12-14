// components/form/ImagePicker.tsx
/**
 * Enhanced Image Picker Component for Profile Photos
 * Modern design with smooth animations and refined styling
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  AlertButton,
  Animated,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ImagePickerProps {
  value?: string;
  onChange: (image: { uri: string; type: string; base64: string } | null) => void;
  maxSize?: number;
  required?: boolean;
}

export function ImagePicker({
  value,
  onChange,
  maxSize = 5,
  required = false,
}: ImagePickerProps) {
  const [loading, setLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: value
            ? ['Cancel', 'Camera', 'Photo Library', 'Remove Photo']
            : ['Cancel', 'Camera', 'Photo Library'],
          destructiveButtonIndex: value ? 3 : undefined,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          } else if (buttonIndex === 3 && value) {
            removePhoto();
          }
        }
      );
    } else {
      Alert.alert('Select Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        ...((value
          ? [
              {
                text: 'Remove Photo',
                onPress: removePhoto,
                style: 'destructive',
              },
            ]
          : []) as AlertButton[]),
      ]);
    }
  };

  const removePhoto = () => {
    if (!required) {
      onChange(null);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      setLoading(true);

      const cameraPermission =
        await ExpoImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take a photo.'
        );
        return;
      }

      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      await handleImageResult(result);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setLoading(true);

      const permissionResult =
        await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select a profile picture.'
        );
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      await handleImageResult(result);
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setLoading(false);
    }
  };

  const handleImageResult = async (
    result: ExpoImagePicker.ImagePickerResult
  ) => {
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const size = blob.size / (1024 * 1024);

      if (size > maxSize) {
        Alert.alert(
          'File Too Large',
          `Please select an image smaller than ${maxSize}MB`
        );
        return;
      }

      const type = asset.uri.substring(asset.uri.lastIndexOf('.') + 1);

      onChange({
        uri: asset.uri,
        type: `image/${type}`,
        base64: asset.base64!,
      });
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  return (
    <View className="items-center mb-4">
      {/* Image Container */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: value ? 0.15 : 0,
          shadowRadius: 12,
          elevation: value ? 4 : 0,
        }}
      >
        <TouchableOpacity
          className={cn(
            'w-32 h-32 rounded-full bg-white justify-center items-center overflow-hidden border-4',
            value ? 'border-indigo-600' : 'border-gray-200'
          )}
          onPress={showImagePickerOptions}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : value ? (
            <Image
              source={{ uri: value }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
              <Text className="text-xs text-gray-400 mt-2 font-medium">Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Change/Add Button */}
      <TouchableOpacity
        className={cn(
          'mt-4 py-2.5 px-5 rounded-xl',
          value ? 'bg-gray-100' : 'bg-indigo-50'
        )}
        onPress={showImagePickerOptions}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text className={cn(
          'text-sm font-semibold',
          value ? 'text-gray-700' : 'text-indigo-700'
        )}>
          {value ? 'Change Photo' : 'Add Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default ImagePicker;