// components/feedback/Toast.tsx
/**
 * Toast Setup Component
 * Configures the app-wide toast notifications
 */

import React from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './ToastConfig';

export const ToastSetup: React.FC = () => {
  return <Toast config={toastConfig} />;
};

export default ToastSetup;