// components/ui/StatusBadge.tsx
/**
 * Enhanced Status Badge Component
 * Modern design with refined styling and better visual hierarchy
 */

import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

// Event status types
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'finished' | 'cancelled';

// Registration status types
export type RegistrationStatus = 'pending' | 'confirmed' | 'attended' | 'canceled';

export interface StatusBadgeProps extends ViewProps {
  status: EventStatus | RegistrationStatus;
  customLabel?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge = React.forwardRef<View, StatusBadgeProps>(
  (
    {
      status,
      customLabel,
      showIcon = true,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    // Status configuration: colors, icons, labels
    const statusConfig: Record<string, {
      bg: string;
      text: string;
      border: string;
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      iconColor: string;
    }> = {
      // Event statuses
      draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: 'document-text-outline',
        label: 'Draft',
        iconColor: '#374151',
      },
      published: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: 'checkmark-circle',
        label: 'Published',
        iconColor: '#4338ca',
      },
      ongoing: {
        bg: 'bg-teal-100',
        text: 'text-teal-700',
        border: 'border-teal-200',
        icon: 'play-circle',
        label: 'Ongoing',
        iconColor: '#0f766e',
      },
      finished: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'checkmark-done-circle',
        label: 'Finished',
        iconColor: '#15803d',
      },
      cancelled: {
        bg: 'bg-rose-100',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: 'close-circle',
        label: 'Cancelled',
        iconColor: '#be123c',
      },
      
      // Registration statuses
      pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: 'time-outline',
        label: 'Pending',
        iconColor: '#b45309',
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'checkmark-circle',
        label: 'Confirmed',
        iconColor: '#15803d',
      },
      attended: {
        bg: 'bg-teal-100',
        text: 'text-teal-700',
        border: 'border-teal-200',
        icon: 'checkmark-done',
        label: 'Attended',
        iconColor: '#0f766e',
      },
      canceled: {
        bg: 'bg-rose-100',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: 'close-circle',
        label: 'Canceled',
        iconColor: '#be123c',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const displayLabel = customLabel || config.label;

    const sizeStyles = {
      sm: {
        container: 'px-2 py-1',
        text: 'text-xs',
        icon: 12,
      },
      md: {
        container: 'px-2.5 py-1.5',
        text: 'text-sm',
        icon: 14,
      },
    };

    return (
      <View
        ref={ref}
        className={cn(
          'inline-flex flex-row items-center justify-center rounded-full border',
          config.bg,
          config.border,
          sizeStyles[size].container,
          className
        )}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
          elevation: 1,
        }}
        {...props}
      >
        {showIcon && (
          <Ionicons
            name={config.icon}
            size={sizeStyles[size].icon}
            color={config.iconColor}
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          className={cn(
            'font-semibold',
            config.text,
            sizeStyles[size].text
          )}
        >
          {displayLabel}
        </Text>
      </View>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';