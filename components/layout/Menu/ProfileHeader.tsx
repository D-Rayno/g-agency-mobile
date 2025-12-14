// components/layout/Menu/ProfileHeader.tsx
/**
 * Profile Header Component for Menu
 * Pure NativeWind styling - no theme hooks
 */

import { User } from '@/types/admin';
import { serverStorage } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Text, View } from 'react-native';

type ProfileHeaderProps = {
  user?: User | null;
};

export const ProfileHeader = memo(({ user }: ProfileHeaderProps) => {
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || 'User';

  return (
    <View className="p-8 bg-white rounded-xl items-center mb-4 shadow-md">
      {/* Avatar Container */}
      <View className="relative mb-6">
      {user?.avatarUrl ? (
        <Image
          source={{ uri: serverStorage(user.avatarUrl) }}
          className="w-25 h-25 rounded-full border-4 border-primary-500"
          contentFit="cover"
        />
      ) : (
          <View className="w-25 h-25 rounded-full bg-primary-100 border-4 border-primary-500 justify-center items-center">
            <Ionicons name="person" size={50} color="#4F46E5" />
          </View>
        )}

        {/* Camera Badge */}
        <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 justify-center items-center border-3 border-white">
          <Ionicons name="camera" size={16} color="#FFFFFF" />
        </View>
      </View>

      {/* Name */}
      <Text className="text-2xl font-bold text-gray-800 mb-1 text-center">
        {displayName}
      </Text>

      {/* Email */}
      <Text className="text-base text-gray-500 text-center">{user?.email}</Text>
    </View>
  );
});

ProfileHeader.displayName = 'ProfileHeader';