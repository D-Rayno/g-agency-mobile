// app/(admin)/scan.tsx
/**
 * QR Code Scanner Screen
 * Pure NativeWind styling - no theme hooks
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { BodyText, Caption, Heading3 } from '@/components/ui/Typography';
import { adminApi } from '@/services/api/admin-api';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || verifying) return;

    setScanned(true);
    setVerifying(true);

    try {
      const response = await adminApi.verifyQRCode(data);
      
      if (response.success && response.data) {
        setRegistrationData(response.data);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not valid or has already been used.');
        setScanned(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to verify QR code');
      setScanned(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmAttendance = async () => {
    if (!registrationData?.qrCode) return;

    try {
      await adminApi.confirmAttendance(registrationData.qrCode);
      Alert.alert(
        'Success',
        'Attendance confirmed successfully',
        [
          {
            text: 'Scan Another',
            onPress: () => {
              setScanned(false);
              setRegistrationData(null);
            },
          },
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm attendance');
    }
  };

  const handleCancel = () => {
    setScanned(false);
    setRegistrationData(null);
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Container safe>
          <View className="flex-1 justify-center items-center p-6">
            <BodyText align="center">Requesting camera permission...</BodyText>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Container safe>
          <View className="flex-1 justify-center items-center p-6">
            <Ionicons name="camera-outline" size={64} color="#9CA3AF" className="mb-6" />
            <Heading3 align="center" className="mb-4">Camera Permission Required</Heading3>
            <BodyText align="center" color="gray" className="mb-6">
              We need your permission to use the camera for scanning QR codes
            </BodyText>
            <Button onPress={requestPermission}>
              Grant Permission
            </Button>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Heading3>Scan QR Code</Heading3>
        <View className="w-10" />
      </View>

      {/* Camera View */}
      <View className="flex-1">
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          className="flex-1"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          {/* Scanning Overlay */}
          <View className="flex-1">
            <View className="flex-1 bg-black/60" />
            <View className="flex-row flex-[1.5]">
              <View className="flex-1 bg-black/60" />
              <View 
                className="flex-[6] border-2 rounded-2xl relative"
                style={{ borderColor: scanned ? '#10B981' : '#1F6F61' }}
              >
                {!scanned && (
                  <View className="flex-1 justify-center items-center">
                    <View className="w-[90%] h-0.5 bg-primary-600 opacity-80" />
                  </View>
                )}
                {scanned && (
                  <View className="flex-1 justify-center items-center bg-white/10">
                    <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                  </View>
                )}
              </View>
              <View className="flex-1 bg-black/60" />
            </View>
            <View className="flex-1 bg-black/60" />
          </View>

          {/* Instructions */}
          <View className="absolute bottom-24 left-0 right-0 items-center">
            <Text className="text-base font-semibold text-white text-center px-6 py-3 bg-black/70 rounded-lg">
              {scanned ? 'QR Code Scanned' : 'Position QR code within the frame'}
            </Text>
          </View>
        </CameraView>
      </View>

      {/* Registration Details */}
      {registrationData && (
        <View className="p-4 bg-white rounded-t-3xl shadow-lg">
          <Card className="p-4">
            <View className="mb-4">
              <Caption color="gray" className="mb-1">Event</Caption>
              <BodyText weight="semibold">{registrationData.event?.name || 'Unknown Event'}</BodyText>
            </View>

            <View className="mb-4">
              <Caption color="gray" className="mb-1">Participant</Caption>
              <BodyText weight="semibold">
                {registrationData.user?.firstName} {registrationData.user?.lastName}
              </BodyText>
              <Caption>{registrationData.user?.email}</Caption>
            </View>

            <View className="mb-4">
              <Caption color="gray" className="mb-1">Status</Caption>
              <View className="flex-row items-center">
                <View
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor:
                      registrationData.status === 'confirmed'
                        ? '#D1FAE5'
                        : registrationData.status === 'attended'
                        ? '#DBEAFE'
                        : '#FEF3C7',
                  }}
                >
                  <Caption
                    style={{
                      color:
                        registrationData.status === 'confirmed'
                          ? '#059669'
                          : registrationData.status === 'attended'
                          ? '#2563EB'
                          : '#D97706',
                      fontWeight: 'bold',
                      fontSize: 12,
                    }}
                  >
                    {registrationData.status.toUpperCase()}
                  </Caption>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  variant="outline"
                  onPress={handleCancel}
                >
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  onPress={handleConfirmAttendance}
                  isDisabled={registrationData.status === 'attended'}
                >
                  {registrationData.status === 'attended' ? 'Already Confirmed' : 'Confirm Attendance'}
                </Button>
              </View>
            </View>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}
