// app/(auth)/login.tsx
import { showErrorToast } from '@/components/feedback/ToastConfig';
import { PasswordInput } from '@/components/form/PasswordInput';
import { SubmitButton } from '@/components/form/SubmitButton';
import { FormLayout } from '@/components/form/layout';
import { Container } from '@/components/ui/Container';
import { useTheme } from '@/hooks/use-theme';
import { useAdminAuth } from '@/stores/admin-auth';
import { adminLoginSchema } from '@/validations/auth';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const { colors, spacing, typography } = useTheme();
  const { login, isLoading } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formConfig = {
    resolver: yupResolver(adminLoginSchema),
    defaultValues: {
      password: '',
    },
  };

  const handleLogin = async (data: { password: string }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const deviceId = Constants.deviceId || Device.modelId || `device_${Date.now()}`;
      
      const success = await login(
        data.password,
        deviceId,
        undefined // FCM token
      );

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

  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: spacing['2xl'],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing['2xl'],
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.muted,
      textAlign: 'center',
    },
    formContainer: {
      gap: spacing.xl,
    },
    footer: {
      marginTop: spacing['2xl'],
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: colors.muted,
      opacity: 0.8,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.primary + '10', colors.background]}
        style={styles.background}
      >
        <Container scroll safe>
          <View style={styles.contentContainer}>
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
                </View>
                <Text style={styles.title}>Admin Access</Text>
                <Text style={styles.subtitle}>
                  G-Agency Events
                </Text>
              </View>

              <FormLayout
                formConfig={formConfig}
                onSubmit={handleLogin}
                enableCard={false}
                enableScrolling={false}
                containerStyle={styles.formContainer}
              >
                <PasswordInput
                  name="password"
                  label="Password"
                  placeholder="Enter admin password"
                  icon={<Ionicons name="lock-closed-outline" size={20} color={colors.muted} />}
                />

                <SubmitButton
                  onSubmit={handleLogin}
                  isLoading={isSubmitting || isLoading}
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Ionicons name="log-in-outline" size={20} color="white" />}
                >
                  Sign In
                </SubmitButton>
              </FormLayout>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Version {Constants.expoConfig?.version || '1.0.0'}
                </Text>
              </View>
            </View>
          </View>
        </Container>
      </LinearGradient>
    </View>
  );
}
