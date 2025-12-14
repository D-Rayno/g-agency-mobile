// components/layout/Menu/ProfileHeader.tsx
/**
 * Enhanced Profile Header Component for Menu
 * Modern design with gradient effects and refined styling
 */

import { User } from '@/types/admin';
import { serverStorage } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View className="mb-6 overflow-hidden rounded-2xl">
      {/* Gradient Background */}
      <LinearGradient
        colors={['#6366f1', '#4f46e5', '#4338ca']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-8 pb-6"
      >
        <View className="items-center">
          {/* Avatar Container */}
          <View 
            className="relative mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: serverStorage(user.avatarUrl) }}
                className="w-24 h-24 rounded-full border-4 border-white"
                contentFit="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-white border-4 border-white justify-center items-center">
                <Ionicons name="person" size={48} color="#6366f1" />
              </View>
            )}

            {/* Camera Badge */}
            <View 
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white justify-center items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Ionicons name="camera" size={18} color="#6366f1" />
            </View>
          </View>

          {/* Name */}
          <Text className="text-2xl font-bold text-white mb-1 text-center">
            {displayName}
          </Text>

          {/* Email */}
          <Text className="text-base text-indigo-100 text-center font-normal">
            {user?.email}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
});

ProfileHeader.displayName = 'ProfileHeader';