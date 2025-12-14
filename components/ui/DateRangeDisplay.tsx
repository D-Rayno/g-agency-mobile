// components/ui/DateRangeDisplay.tsx
import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface DateRangeDisplayProps extends ViewProps {
  startDate: string | Date;
  endDate: string | Date;
  format?: 'full' | 'short' | 'compact';
  showTime?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const DateRangeDisplay = React.forwardRef<View, DateRangeDisplayProps>(
  (
    {
      startDate,
      endDate,
      format = 'short',
      showTime = true,
      showIcon = true,
      className,
      ...props
    },
    ref
  ) => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();

    // Helper: Check if same day
    const isSameDay = (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    // Helper: Check if today/tomorrow
    const getRelativeDay = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      if (dateOnly.getTime() === today.getTime()) return 'Today';
      if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';
      return null;
    };

    // Format date based on variant
    const formatDate = (date: Date, includeTime: boolean = showTime) => {
      const relativeDay = getRelativeDay(date);

      if (format === 'compact') {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return includeTime
          ? `${month} ${day}, ${formatTime(date)}`
          : `${month} ${day}`;
      }

      if (format === 'short') {
        if (relativeDay) {
          return includeTime ? `${relativeDay}, ${formatTime(date)}` : relativeDay;
        }
        const formatted = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        return includeTime ? `${formatted}, ${formatTime(date)}` : formatted;
      }

      // Full format
      if (relativeDay) {
        const fullDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        return includeTime
          ? `${relativeDay} (${fullDate}), ${formatTime(date)}`
          : `${relativeDay} (${fullDate})`;
      }

      const formatted = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return includeTime ? `${formatted}, ${formatTime(date)}` : formatted;
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    // Generate display text
    const getDisplayText = () => {
      if (isSameDay(start, end)) {
        // Same day event
        const dateStr = formatDate(start, false);
        if (showTime) {
          return `${dateStr}, ${formatTime(start)} - ${formatTime(end)}`;
        }
        return dateStr;
      } else {
        // Multi-day event
        return `${formatDate(start)} - ${formatDate(end)}`;
      }
    };

    return (
      <View
        ref={ref}
        className={cn('flex-row items-center', className)}
        {...props}
      >
        {showIcon && (
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#6b7280"
            style={{ marginRight: 6 }}
          />
        )}
        <Text className="text-sm text-gray-700 flex-1">
          {getDisplayText()}
        </Text>
      </View>
    );
  }
);

DateRangeDisplay.displayName = 'DateRangeDisplay';
