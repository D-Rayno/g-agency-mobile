// app/(auth)/login.tsx
/**
 * Ultra-Premium Login Screen
 * Completely rewritten with stunning UI/UX and enhanced components
 */

import { showErrorToast } from '@/components/feedback/ToastConfig';
import { useAdminAuth } from '@/stores/admin-auth';
import { adminLoginSchema } from '@/validations/auth';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, isLoading } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(adminLoginSchema),
    defaultValues: {
      password: '',
    },
  });

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onSubmit = async (data: { password: string }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const deviceId = Constants.deviceId || Device.modelId || `device_${Date.now()}`;
      
      const success = await login(data.password, deviceId, undefined);

      if (success) {
        router.replace('/(admin)/(tabs)');
      } else {
        showErrorToast('Login Failed', 'Invalid password or credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showErrorToast('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Ultra-Premium Multi-Layer Gradient Background */}
      <LinearGradient
        colors={['#4F46E5', '#6366f1', '#818cf8', '#a5b4fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 h-[75%]"
      />
      
      {/* Decorative Gradient Overlay */}
      <LinearGradient
        colors={['rgba(79, 70, 229, 0.1)', 'transparent']}
        className="absolute top-0 left-0 right-0 bottom-0"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Animated.View 
          className="flex-1 justify-center px-8"
          style={{ opacity: fadeAnim }}
        >
          {/* Premium Branding Section */}
          <View className="items-center mb-20">
            {/* Enhanced Logo with Multiple Layers */}
            <View className="mb-10 relative">
              {/* Outer Glow */}
              <View className="absolute -inset-4 bg-white/10 rounded-[40px] blur-2xl" />
              
              {/* Main Logo Container */}
              <View className="w-40 h-40 rounded-[36px] bg-white/30 backdrop-blur-3xl justify-center items-center border-[4px] border-white/50 shadow-2xl relative">
                {/* Inner Gradient */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                  className="absolute inset-0 rounded-[32px]"
                />
                <Ionicons name="shield-checkmark" size={80} color="#ffffff" />
              </View>
            </View>

            {/* Enhanced Brand Text with Shadow */}
            <View className="items-center">
              <Text className="text-6xl font-black text-white mb-3 tracking-tighter" style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12 }}>
                Admin Portal
              </Text>
              <Text className="text-2xl font-bold text-white/95 tracking-wide mb-5">
                G-Agency Events
              </Text>
              
              {/* Premium Badge */}
              <View className="bg-white/25 backdrop-blur-xl px-8 py-3 rounded-2xl border-2 border-white/40 shadow-xl">
                <Text className="text-base font-black text-white/95 tracking-widest uppercase">
                  Secure Access
                </Text>
              </View>
            </View>
          </View>

          {/* Ultra-Premium Login Card */}
          <View className="bg-white rounded-[32px] p-10 shadow-2xl border-[3px] border-gray-50 relative">
            {/* Decorative Corner Accent */}
            <View className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-[32px] rounded-tr-[29px] opacity-50" />
            
            {/* Welcome Section */}
            <View className="mb-10 relative z-10">
              <Text className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                Welcome Back
              </Text>
              <Text className="text-xl text-gray-600 font-semibold">
                Sign in to manage your events
              </Text>
            </View>

            {/* Enhanced Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-8">
                  {/* Label */}
                  <Text className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">
                    Admin Password
                  </Text>

                  {/* Input Container */}
                  <View
                    className={`flex-row items-center border-[3px] rounded-2xl bg-gray-50 px-5 transition-all ${
                      isFocused && !errors.password
                        ? 'border-primary-500 bg-primary-50/30 shadow-xl shadow-primary-500/20'
                        : errors.password
                        ? 'border-error-500 bg-error-50/30 shadow-xl shadow-error-500/20'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Icon */}
                    <View className="mr-4">
                      <Ionicons 
                        name="lock-closed" 
                        size={24} 
                        color={isFocused ? '#4F46E5' : '#6b7280'} 
                      />
                    </View>

                    {/* Text Input */}
                    <TextInput
                      className="flex-1 text-gray-900 text-lg py-5 font-semibold"
                      onChangeText={onChange}
                      onBlur={() => {
                        onBlur();
                        setIsFocused(false);
                      }}
                      onFocus={() => setIsFocused(true)}
                      value={value}
                      secureTextEntry={!showPassword}
                      placeholder="Enter your secure password"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                    />

                    {/* Toggle Visibility */}
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      className="p-3 ml-2"
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={isFocused ? '#4F46E5' : '#6B7280'}
                      />
                    </Pressable>
                  </View>

                  {/* Error Message */}
                  {errors.password && (
                    <View className="flex-row items-center mt-3 bg-error-50 px-4 py-3 rounded-xl border-2 border-error-200">
                      <Ionicons name="alert-circle" size={18} color="#ef4444" />
                      <Text className="text-sm text-error-700 ml-2 font-bold">
                        {errors.password.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />

            {/* Enhanced Submit Button */}
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || isLoading}
              className="relative overflow-hidden rounded-2xl shadow-2xl"
            >
              <LinearGradient
                colors={['#4F46E5', '#6366f1', '#818cf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-8 py-6 flex-row items-center justify-center"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <View className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    <Text className="text-xl font-black text-white tracking-wide">
                      Signing In...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="log-in" size={26} color="white" />
                    <Text className="text-xl font-black text-white tracking-wide ml-3">
                      Sign In Securely
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Enhanced Security Badge */}
            <View className="mt-10 flex-row items-center justify-center bg-success-50 px-6 py-4 rounded-2xl border-[3px] border-success-200 shadow-lg">
              <View className="w-10 h-10 bg-success-100 rounded-full items-center justify-center mr-3 border-2 border-success-300">
                <Ionicons name="shield-checkmark" size={22} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-success-900 font-black uppercase tracking-wide">
                  Encrypted Connection
                </Text>
                <Text className="text-xs text-success-700 font-semibold mt-0.5">
                  Your data is protected
                </Text>
              </View>
            </View>
          </View>

          {/* Enhanced Footer */}
          <View className="items-center mt-12">
            <View className="bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl border-2 border-white/30 mb-3">
              <Text className="text-lg text-white font-black">
                Version {Constants.expoConfig?.version || '1.0.0'}
              </Text>
            </View>
            <Text className="text-base text-white/80 font-semibold">
              © 2024 G-Agency. All rights reserved.
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
