// app/(admin)/scan.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { BodyText, Caption, Heading3 } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRScannerScreen() {
  const { colors, spacing } = useTheme();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Container safe>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
            <BodyText align="center">Requesting camera permission...</BodyText>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Container safe>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
            <Ionicons name="camera-outline" size={64} color={colors.muted} style={{ marginBottom: spacing.lg }} />
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Heading3>Scan QR Code</Heading3>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          {/* Scanning Overlay */}
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer} />
              <View style={[styles.focusedContainer, { borderColor: scanned ? colors.success : colors.primary }]}>
                {!scanned && (
                  <View style={styles.scanningLine}>
                    <View style={[styles.scanLine, { backgroundColor: colors.primary }]} />
                  </View>
                )}
                {scanned && (
                  <View style={styles.scannedIndicator}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                  </View>
                )}
              </View>
              <View style={styles.unfocusedContainer} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructions, { color: colors.card }]}>
              {scanned ? 'QR Code Scanned' : 'Position QR code within the frame'}
            </Text>
          </View>
        </CameraView>
      </View>

      {/* Registration Details */}
      {registrationData && (
        <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
          <Card className="p-4">
            <View style={{ marginBottom: spacing.md }}>
              <Caption color="gray" className="mb-1">Event</Caption>
              <BodyText weight="semibold">{registrationData.event?.name || 'Unknown Event'}</BodyText>
            </View>

            <View style={{ marginBottom: spacing.md }}>
              <Caption color="gray" className="mb-1">Participant</Caption>
              <BodyText weight="semibold">
                {registrationData.user?.firstName} {registrationData.user?.lastName}
              </BodyText>
              <Caption>{registrationData.user?.email}</Caption>
            </View>

            <View style={{ marginBottom: spacing.md }}>
              <Caption color="gray" className="mb-1">Status</Caption>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor:
                      registrationData.status === 'confirmed'
                        ? colors.success + '20'
                        : registrationData.status === 'attended'
                        ? colors.primary + '20'
                        : colors.warning + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Caption
                    style={{
                      color:
                        registrationData.status === 'confirmed'
                          ? colors.success
                          : registrationData.status === 'attended'
                          ? colors.primary
                          : colors.warning,
                      fontWeight: 'bold',
                      fontSize: 12,
                    }}
                  >
                    {registrationData.status.toUpperCase()}
                  </Caption>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Button
                variant="outline"
                onPress={handleCancel}
                style={{ flex: 1, marginRight: spacing.sm }}
              >
                Cancel
              </Button>
              <Button
                onPress={handleConfirmAttendance}
                style={{ flex: 1 }}
                disabled={registrationData.status === 'attended'}
              >
                {registrationData.status === 'attended' ? 'Already Confirmed' : 'Confirm Attendance'}
              </Button>
            </View>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
    borderWidth: 2,
    borderRadius: 16,
    position: 'relative',
  },
  scanningLine: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    width: '90%',
    height: 2,
    opacity: 0.8,
  },
  scannedIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  detailsContainer: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});
