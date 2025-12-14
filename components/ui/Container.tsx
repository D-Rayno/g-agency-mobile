// components/ui/Container.tsx
/**
 * Enhanced Container Component
 * Modern design with flexible layout options
 */

import { cn } from '@/utils/cn';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  ViewProps
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  safe?: boolean;
  scroll?: boolean;
  keyboardAware?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  className?: string;
}

export const Container = React.forwardRef<View, ContainerProps>(
  (
    {
      children,
      safe = true,
      scroll = false,
      keyboardAware = false,
      padding = 'md',
      backgroundColor = '#F9FAFB',
      className,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const content = (
      <View
        ref={ref}
        className={cn('flex-1', paddingStyles[padding], className)}
        style={{ backgroundColor }}
        {...props}
      >
        {children}
      </View>
    );

    if (keyboardAware) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          style={{ backgroundColor }}
        >
          {scroll ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className={cn(paddingStyles[padding], className)}>
                {children}
              </View>
            </ScrollView>
          ) : safe ? (
            <SafeAreaView className="flex-1" style={{ backgroundColor }}>
              {content}
            </SafeAreaView>
          ) : (
            content
          )}
        </KeyboardAvoidingView>
      );
    }

    if (scroll) {
      const ScrollContainer = safe ? SafeAreaView : View;
      return (
        <ScrollContainer className="flex-1" style={{ backgroundColor }}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View className={cn(paddingStyles[padding], className)}>
              {children}
            </View>
          </ScrollView>
        </ScrollContainer>
      );
    }

    if (safe) {
      return (
        <SafeAreaView className="flex-1" style={{ backgroundColor }}>
          {content}
        </SafeAreaView>
      );
    }

    return content;
  }
);

Container.displayName = 'Container';

// Enhanced Screen Container with common patterns
export interface ScreenProps extends ContainerProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ScreenContainer = React.forwardRef<View, ScreenProps>(
  ({ children, header, footer, ...props }, ref) => {
    return (
      <Container ref={ref} {...props}>
        {header && <View className="mb-4">{header}</View>}
        <View className="flex-1">{children}</View>
        {footer && <View className="mt-4">{footer}</View>}
      </Container>
    );
  }
);

ScreenContainer.displayName = 'ScreenContainer';