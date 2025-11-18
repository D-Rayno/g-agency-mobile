// components/ToastSetup.tsx - App-wide Toast Configuration
import React from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './config';



export const ToastSetup: React.FC = () => {
  return (
      <Toast config={toastConfig} />
  );
};

export default ToastSetup;