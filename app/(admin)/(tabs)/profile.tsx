// app/(admin)/(tabs)/profile.tsx
/**
 * Ultra-Premium Profile Screen
 * Enhanced with better spacing and visual hierarchy
 */

import { Card } from '@/components/ui/Card';
import { useAdminAuth } from '@/stores/admin-auth';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
          <Text className="text-5xl font-black text-white tracking-tighter mb-3">
            Profile
          </Text>
          <Text className="text-lg text-white/90 font-semibold">
            Manage your admin account
          </Text>

          {/* Enhanced Large Avatar */}
          <View className="items-center mt-12">
            <View className="w-36 h-36 rounded-[32px] bg-white/25 backdrop-blur-2xl items-center justify-center border-[3px] border-white/40 shadow-2xl">
              <Ionicons name="shield-checkmark" size={72} color="#ffffff" />
            </View>
            <Text className="text-3xl font-black text-white mt-6">
              Admin User
            </Text>
            <View className="mt-3 bg-white/20 px-6 py-2.5 rounded-full border border-white/30">
              <Text className="text-base text-white/95 font-bold tracking-wide">
                G-Agency Events Admin
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Enhanced Menu Sections */}
        <View className="px-8">
          {/* App Information */}
          <View className="mb-8">
            <Text className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 px-2">
              App Information
            </Text>
            <Card variant="elevated" className="p-0 overflow-hidden">
              <View className="px-6 py-5 flex-row justify-between items-center border-b-2 border-gray-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-primary-100 items-center justify-center mr-4">
                    <Ionicons name="information-circle" size={24} color="#4F46E5" />
                  </View>
                  <Text className="text-lg text-gray-700 font-semibold">Version</Text>
                </View>
                <Text className="text-lg font-black text-gray-900">
                  {Constants.expoConfig?.version || '1.0.0'}
                </Text>
              </View>
              
              <View className="px-6 py-5 flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-secondary-100 items-center justify-center mr-4">
                    <Ionicons name="code-slash" size={24} color="#14B8A6" />
                  </View>
                  <Text className="text-lg text-gray-700 font-semibold">Build Number</Text>
                </View>
                <Text className="text-lg font-black text-gray-900">
                  {Constants.expoConfig?.android?.versionCode || 
                   Constants.expoConfig?.ios?.buildNumber || 
                   '1'}
                </Text>
              </View>
            </Card>
          </View>

          {/* Account Actions */}
          <View className="mb-8">
            <Text className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 px-2">
              Account Actions
            </Text>
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
                        <Text className="text-xl font-extrabold text-gray-900">Logout</Text>
                        <Text className="text-sm text-gray-600 mt-1 font-medium">
                          Sign out from this device
                        </Text>
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
                        <Text className="text-xl font-extrabold text-error-700">
                          Logout All Devices
                        </Text>
                        <Text className="text-sm text-gray-600 mt-1 font-medium">
                          Sign out everywhere
                        </Text>
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
                <Text className="text-base font-extrabold text-primary-900 mb-2">
                  Security Notice
                </Text>
                <Text className="text-sm text-primary-800 leading-6 font-medium">
                  Your admin session is secured with end-to-end encryption. Always logout when using shared devices.
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
