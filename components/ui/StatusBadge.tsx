// components/ui/StatusBadge.tsx
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
    }> = {
      // Event statuses
      draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: 'document-outline',
        label: 'Draft',
      },
      published: {
        bg: 'bg-primary-100',
        text: 'text-primary-700',
        border: 'border-primary-200',
        icon: 'checkmark-circle',
        label: 'Published',
      },
      ongoing: {
        bg: 'bg-secondary-100',
        text: 'text-secondary-700',
        border: 'border-secondary-200',
        icon: 'play-circle',
        label: 'Ongoing',
      },
      finished: {
        bg: 'bg-success-100',
        text: 'text-success-700',
        border: 'border-success-200',
        icon: 'checkmark-done-circle',
        label: 'Finished',
      },
      cancelled: {
        bg: 'bg-error-100',
        text: 'text-error-700',
        border: 'border-error-200',
        icon: 'close-circle',
        label: 'Cancelled',
      },
      
      // Registration statuses
      pending: {
        bg: 'bg-warning-100',
        text: 'text-warning-700',
        border: 'border-warning-200',
        icon: 'time-outline',
        label: 'Pending',
      },
      confirmed: {
        bg: 'bg-success-100',
        text: 'text-success-700',
        border: 'border-success-200',
        icon: 'checkmark-circle',
        label: 'Confirmed',
      },
      attended: {
        bg: 'bg-secondary-100',
        text: 'text-secondary-700',
        border: 'border-secondary-200',
        icon: 'checkmark-done',
        label: 'Attended',
      },
      canceled: {
        bg: 'bg-error-100',
        text: 'text-error-700',
        border: 'border-error-200',
        icon: 'close-circle',
        label: 'Canceled',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const displayLabel = customLabel || config.label;

    const sizeStyles = {
      sm: {
        container: 'px-2 py-0.5',
        text: 'text-2xs',
        icon: 12,
      },
      md: {
        container: 'px-2.5 py-1',
        text: 'text-xs',
        icon: 14,
      },
    };

    const iconColor = config.text.includes('primary') ? '#3730a3'
      : config.text.includes('secondary') ? '#0f766e'
      : config.text.includes('success') ? '#15803d'
      : config.text.includes('warning') ? '#b45309'
      : config.text.includes('error') ? '#b91c1c'
      : '#374151';

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
        {...props}
      >
        {showIcon && (
          <Ionicons
            name={config.icon}
            size={sizeStyles[size].icon}
            color={iconColor}
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
