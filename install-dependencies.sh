#!/bin/bash

# Expo React Native Dependencies Installation Script
# For G-Agency Events Mobile App

echo "🚀 Installing missing dependencies for G-Agency Events Mobile App..."

# Core Dependencies (not in current package.json)
echo "📦 Installing core dependencies..."
npm install axios
npm install lodash
npm install yup
npm install zustand
npm install @hookform/resolvers
npm install react-hook-form

# Expo Modules
echo "📦 Installing Expo modules..."
npm install expo-device
npm install expo-image-picker
npm install expo-localization
npm install expo-notifications
npm install expo-secure-store

# React Native Modules
echo "📦 Installing React Native modules..."
npm install @react-native-community/netinfo
npm install react-native-toast-message
npm install react-native-mask-input
npm install react-native-country-codes-picker

# Navigation & UI
echo "📦 Installing navigation and UI modules..."
npm install react-native-reanimated-carousel

# Firebase (if needed - check if firebase folder exists)
echo "📦 Installing Firebase modules..."
npm install firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
npm install @react-native-firebase/analytics

# Development Dependencies
echo "📦 Installing development dependencies..."
npm install --save-dev @types/lodash

# Optional: Lottie (if animation files exist)
if [ -d "assets/animations" ] || [ -f "*.json" ]; then
    echo "📦 Installing Lottie for animations..."
    npm install lottie-react-native
    npm install lottie-ios
fi

echo "✅ All dependencies installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Run: npx expo install"  # This will ensure all native modules are properly linked
echo "2. Run: npm start"
echo "3. If you encounter any issues, try: npx expo install --fix"
echo ""