// app/(auth)/login.tsx
/**
 * Ultra-Premium Login Screen
 * Refactored with ScrollView and optimized for all screen sizes
 */

import { PasswordInput } from '@/components/form/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Caption, Typography } from '@/components/ui/Typography';
import { useAdminAuth } from '@/stores/admin-auth';
import { ToastUtils } from '@/utils/toast';
import { adminLoginSchema } from '@/validations/auth';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, isLoading } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const methods = useForm({
    resolver: yupResolver(adminLoginSchema),
    defaultValues: {
      password: '',
    },
  });

  useEffect(() => {
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
        ToastUtils.error('auth.loginFailed', 'auth.invalidCredentials', 'Login Failed', 'Invalid password or credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      ToastUtils.error('common.error', 'api.errorMessage', 'Error', 'An unexpected error occurred.');
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
        className="absolute top-0 left-0 right-0 h-[70%]"
      />
      
      {/* Decorative Gradient Overlay */}
      <LinearGradient
        colors={['rgba(79, 70, 229, 0.1)', 'transparent']}
        className="absolute top-0 left-0 right-0 bottom-0"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            className="flex-1 justify-center px-5 py-6"
            style={{ opacity: fadeAnim }}
          >
            {/* Premium Branding Section */}
            <View className="items-center mb-10">
              {/* Enhanced Logo with Multiple Layers */}
              <View className="mb-6 relative">
                {/* Outer Glow */}
                <View className="absolute -inset-3 bg-white/10 rounded-[32px] blur-xl" />
                
                {/* Main Logo Container */}
                <View className="w-28 h-28 rounded-[28px] bg-white/30 backdrop-blur-3xl justify-center items-center border-[3px] border-white/50 shadow-xl relative">
                  {/* Inner Gradient */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                    className="absolute inset-0 rounded-[25px]"
                  />
                  <Ionicons name="shield-checkmark" size={56} color="#ffffff" />
                </View>
              </View>

              {/* Enhanced Brand Text */}
              <View className="items-center">
                <Typography 
                  variant="h2" 
                  weight="black" 
                  color="white" 
                  align="center"
                  className="mb-2 tracking-tight"
                  style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8 }}
                >
                  Admin Portal
                </Typography>
                <Typography 
                  variant="h5" 
                  weight="bold" 
                  color="white" 
                  className="tracking-wide mb-4 opacity-95"
                >
                  G-Agency Events
                </Typography>
                
                {/* Premium Badge */}
                <View className="bg-white/25 backdrop-blur-xl px-5 py-2 rounded-xl border border-white/40 shadow-lg">
                  <Typography 
                    variant="caption" 
                    weight="black" 
                    color="white" 
                    className="tracking-widest uppercase opacity-95"
                  >
                    Secure Access
                  </Typography>
                </View>
              </View>
            </View>

            {/* Ultra-Premium Login Card */}
            <Card variant="premium" className="p-6 rounded-2xl border-2 border-gray-50 relative">
              {/* Decorative Corner Accent */}
              <View className="absolute top-0 right-0 w-16 h-16 bg-primary-50 rounded-bl-2xl rounded-tr-[14px] opacity-50" />
              
              {/* Welcome Section */}
              <View className="mb-6 relative z-10">
                <Typography variant="h4" weight="black" className="mb-2 tracking-tight">
                  Welcome Back
                </Typography>
                <Typography variant="body" weight="semibold" color="gray">
                  Sign in to manage your events
                </Typography>
              </View>

              {/* Form with PasswordInput */}
              <FormProvider {...methods}>
                <View className="mb-5">
                  <PasswordInput
                    name="password"
                    label="Admin Password"
                    placeholder="Enter your secure password"
                    required
                    icon={<Ionicons name="lock-closed" size={20} color="#6366f1" />}
                  />
                </View>

                {/* Enhanced Submit Button */}
                <Button
                  onPress={methods.handleSubmit(onSubmit)}
                  isLoading={isSubmitting || isLoading}
                  isDisabled={isSubmitting || isLoading}
                  fullWidth
                  size="lg"
                  leftIcon={!isSubmitting && !isLoading && <Ionicons name="log-in" size={22} color="white" />}
                  textClassName="text-lg font-black tracking-wide"
                >
                  {isSubmitting || isLoading ? 'Signing In...' : 'Sign In Securely'}
                </Button>
              </FormProvider>

              {/* Enhanced Security Badge */}
              <View className="mt-6 flex-row items-center bg-success-50 px-4 py-3 rounded-xl border-2 border-success-200">
                <View className="w-8 h-8 bg-success-100 rounded-full items-center justify-center mr-3 border border-success-300">
                  <Ionicons name="shield-checkmark" size={18} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Typography variant="caption" weight="black" className="text-success-900 uppercase tracking-wide">
                    Encrypted Connection
                  </Typography>
                  <Caption className="text-success-700 mt-0.5">
                    Your data is protected
                  </Caption>
                </View>
              </View>
            </Card>

            {/* Enhanced Footer */}
            <View className="items-center mt-8">
              <View className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/30 mb-2">
                <Typography variant="caption" weight="bold" color="white">
                  Version {Constants.expoConfig?.version || '1.0.0'}
                </Typography>
              </View>
              <Caption className="text-white/80">
                © 2024 G-Agency. All rights reserved.
              </Caption>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
