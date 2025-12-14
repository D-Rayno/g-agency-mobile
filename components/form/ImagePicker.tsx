// components/form/ImagePicker.tsx
/**
 * Image Picker Component for Profile Photos
 * Pure NativeWind styling - no theme hooks
 */

import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    AlertButton,
    Image,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ImagePickerProps {
  value?: string;
  onChange: (image: { uri: string; type: string; base64: string } | null) => void;
  maxSize?: number; // in MB
  required?: boolean;
}

export function ImagePicker({
  value,
  onChange,
  maxSize = 5,
  required = false,
}: ImagePickerProps) {
  const [loading, setLoading] = useState(false);

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
      // For Android, show a custom alert
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

      // Request camera permissions
      const cameraPermission =
        await ExpoImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take a photo.'
        );
        return;
      }

      // Launch camera
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

      // Request media library permissions
      const permissionResult =
        await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select a profile picture.'
        );
        return;
      }

      // Launch picker
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

      // Check file size
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const size = blob.size / (1024 * 1024); // Convert to MB

      if (size > maxSize) {
        Alert.alert(
          'File Too Large',
          `Please select an image smaller than ${maxSize}MB`
        );
        return;
      }

      // Get file type from uri
      const type = asset.uri.substring(asset.uri.lastIndexOf('.') + 1);

      onChange({
        uri: asset.uri,
        type: `image/${type}`,
        base64: asset.base64!,
      });
    }
  };

  return (
    <View className="items-center mb-2">
      {/* Image Container */}
      <TouchableOpacity
        className="w-30 h-30 rounded-full bg-white justify-center items-center overflow-hidden border border-gray-300"
        onPress={showImagePickerOptions}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : value ? (
          <Image
            source={{ uri: value }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="opacity-50">
            <Ionicons name="person-circle-outline" size={60} color="#9CA3AF" />
          </View>
        )}
      </TouchableOpacity>

      {/* Change/Add Button */}
      <TouchableOpacity
        className="mt-3 py-2 px-3 rounded-lg bg-primary-100"
        onPress={showImagePickerOptions}
        disabled={loading}
      >
        <Text className="text-primary-600 text-sm font-medium">
          {value ? 'Change Photo' : 'Add Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default ImagePicker;
