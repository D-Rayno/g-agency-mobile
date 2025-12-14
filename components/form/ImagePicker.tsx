import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    AlertButton,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ImagePickerProps {
  value?: string;
  onChange: (
    image: { uri: string; type: string; base64: string } | null
  ) => void;
  maxSize?: number; // in MB
  required?: boolean;
}

export function ImagePicker({
  value,
  onChange,
  maxSize = 5,
  required = false,
}: ImagePickerProps) {
  const { colors, spacing } = useTheme();
  const [loading, setLoading] = useState(false);

  const showImagePickerOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: value
            ? ["Cancel", "Camera", "Photo Library", "Remove Photo"]
            : ["Cancel", "Camera", "Photo Library"],
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
      Alert.alert("Select Photo", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Camera", onPress: pickImageFromCamera },
        { text: "Gallery", onPress: pickImageFromGallery },
        ...((value
          ? [
              {
                text: "Remove Photo",
                onPress: removePhoto,
                style: "destructive",
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
          "Camera Permission Required",
          "Please allow camera access to take a photo."
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
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
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
          "Permission Required",
          "Please allow access to your photo library to select a profile picture."
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
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
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
          "File Too Large",
          `Please select an image smaller than ${maxSize}MB`
        );
        return;
      }

      // Get file type from uri
      const type = asset.uri.substring(asset.uri.lastIndexOf(".") + 1);

      onChange({
        uri: asset.uri,
        type: `image/${type}`,
        base64: asset.base64!,
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    imageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    placeholder: {
      opacity: 0.5,
    },
    changeButton: {
      marginTop: 12,
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.primary + "20",
    },
    buttonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={showImagePickerOptions}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : value ? (
          <Image
            source={{ uri: value }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={60}
            color={colors.muted}
            style={styles.placeholder}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.changeButton}
        onPress={showImagePickerOptions}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {value ? "Change Photo" : "Add Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default ImagePicker;
