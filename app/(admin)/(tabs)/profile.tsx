// app/(admin)/(tabs)/profile.tsx
/**
 * Ultra-Premium Profile Screen
 * Enhanced with better spacing and visual hierarchy
 */

import { Card } from '@/components/ui/Card';
import { BodyText, Caption, Heading1, Heading3, Typography } from '@/components/ui/Typography';
import { useAdminAuth } from '@/stores/admin-auth';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { logout, logoutAll } = useAdminAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const handleLogoutAll = () => {
    Alert.alert(
      'Logout All Devices',
      'This will logout from all devices. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout All', style: 'destructive', onPress: () => logoutAll() },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Gradient Header */}
        <LinearGradient
          colors={['#4F46E5', '#6366f1', '#818cf8']}
          className="px-8 pt-8 pb-16 mb-8"
        >
          <Heading1 color="white" className="tracking-tighter mb-3">
            Profile
          </Heading1>
          <BodyText color="white" weight="semibold" className="opacity-90">
            Manage your admin account
          </BodyText>

          {/* Enhanced Large Avatar */}
          <View className="items-center mt-12">
            <View className="w-36 h-36 rounded-[32px] bg-white/25 backdrop-blur-2xl items-center justify-center border-[3px] border-white/40 shadow-2xl">
              <Ionicons name="shield-checkmark" size={72} color="#ffffff" />
            </View>
            <Heading3 color="white" className="mt-6">
              Admin User
            </Heading3>
            <View className="mt-3 bg-white/20 px-6 py-2.5 rounded-full border border-white/30">
              <BodyText color="white" weight="bold" className="tracking-wide opacity-95">
                G-Agency Events Admin
              </BodyText>
            </View>
          </View>
        </LinearGradient>

        {/* Enhanced Menu Sections */}
        <View className="px-8">
          {/* App Information */}
          <View className="mb-8">
            <Caption weight="black" className="uppercase tracking-widest mb-4 px-2">
              App Information
            </Caption>
            <Card variant="elevated" className="p-0 overflow-hidden">
              <View className="px-6 py-5 flex-row justify-between items-center border-b-2 border-gray-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-primary-100 items-center justify-center mr-4">
                    <Ionicons name="information-circle" size={24} color="#4F46E5" />
                  </View>
                  <BodyText color="gray" weight="semibold">Version</BodyText>
                </View>
                <Typography variant="body" weight="black">
                  {Constants.expoConfig?.version || '1.0.0'}
                </Typography>
              </View>
              
              <View className="px-6 py-5 flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-secondary-100 items-center justify-center mr-4">
                    <Ionicons name="code-slash" size={24} color="#14B8A6" />
                  </View>
                  <BodyText color="gray" weight="semibold">Build Number</BodyText>
                </View>
                <Typography variant="body" weight="black">
                  {Constants.expoConfig?.android?.versionCode || 
                   Constants.expoConfig?.ios?.buildNumber || 
                   '1'}
                </Typography>
              </View>
            </Card>
          </View>

          {/* Account Actions */}
          <View className="mb-8">
            <Caption weight="black" className="uppercase tracking-widest mb-4 px-2">
              Account Actions
            </Caption>
            <View className="gap-4">
              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Card variant="elevated" className="p-6">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-14 h-14 rounded-2xl bg-warning-100 items-center justify-center mr-5">
                        <Ionicons name="log-out" size={28} color="#f59e0b" />
                      </View>
                      <View>
                        <Typography variant="h5" weight="extrabold">Logout</Typography>
                        <Caption color="gray" className="mt-1">
                          Sign out from this device
                        </Caption>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={26} color="#d1d5db" />
                  </View>
                </Card>
              </TouchableOpacity>

              {/* Logout All Devices */}
              <TouchableOpacity
                onPress={handleLogoutAll}
                activeOpacity={0.85}
              >
                <Card variant="elevated" className="p-6 border-2 border-error-200">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-14 h-14 rounded-2xl bg-error-100 items-center justify-center mr-5">
                        <Ionicons name="exit" size={28} color="#ef4444" />
                      </View>
                      <View>
                        <Typography variant="h5" weight="extrabold" color="error">
                          Logout All Devices
                        </Typography>
                        <Caption color="gray" className="mt-1">
                          Sign out everywhere
                        </Caption>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={26} color="#fca5a5" />
                  </View>
                </Card>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Security Notice */}
          <Card variant="elevated" className="p-6 bg-primary-50 border-2 border-primary-200 mb-10">
            <View className="flex-row">
              <View className="w-12 h-12 rounded-2xl bg-primary-100 items-center justify-center mr-4">
                <Ionicons name="shield-checkmark" size={26} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="extrabold" className="text-primary-900 mb-2">
                  Security Notice
                </Typography>
                <Caption className="text-primary-800 leading-6">
                  Your admin session is secured with end-to-end encryption. Always logout when using shared devices.
                </Caption>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
