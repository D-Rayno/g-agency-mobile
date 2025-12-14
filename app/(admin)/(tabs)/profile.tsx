// app/(admin)/(tabs)/profile.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { BodyText, Caption, Heading2, Heading3 } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { useAdminAuth } from '@/stores/admin-auth';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';

export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const { logout, logoutAll } = useAdminAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleLogoutAll = () => {
    Alert.alert(
      'Sign Out All Devices',
      'Are you sure you want to sign out from all devices?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out All', style: 'destructive', onPress: logoutAll },
      ]
    );
  };

  return (
    <Container safe>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={{ alignItems: 'center', marginVertical: spacing.lg }}>
          <View style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 50, 
            backgroundColor: colors.primary + '20', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: spacing.md
          }}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <Heading2>Admin User</Heading2>
          <BodyText color="gray">admin@g-agency.com</BodyText>
        </View>

        <View>
          <Heading3 className="mb-4">Settings</Heading3>
          <Card className="p-0 overflow-hidden">
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} style={{ marginRight: 12 }} />
                <BodyText>Notifications</BodyText>
              </View>
              <Switch value={true} trackColor={{ true: colors.primary }} />
            </View>
            
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="moon-outline" size={24} color={colors.text} style={{ marginRight: 12 }} />
                <BodyText>Dark Mode</BodyText>
              </View>
              <Switch value={false} trackColor={{ true: colors.primary }} />
            </View>
          </Card>
        </View>

        <View>
          <Heading3 className="mb-4">Account</Heading3>
          <Button 
            variant="outline" 
            className="mb-3" 
            leftIcon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
            onPress={handleLogout}
          >
            Sign Out
          </Button>
          
          <Button 
            variant="ghost" 
            className="mb-3" 
            leftIcon={<Ionicons name="hardware-chip-outline" size={20} color={colors.danger} />}
            textClassName="text-error-600"
            onPress={handleLogoutAll}
          >
            Sign Out All Devices
          </Button>
        </View>

        <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <Caption>G-Agency Events Admin</Caption>
          <Caption>Version {Constants.expoConfig?.version || '1.0.0'}</Caption>
        </View>
      </ScrollView>
    </Container>
  );
}
