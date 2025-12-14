// components/ui/Avatar.tsx
/**
 * Enhanced Avatar Component
 * Modern design with gradient borders and status indicators
 */

import { cn } from '@/utils/cn';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface AvatarProps extends ViewProps {
  source?: string | { uri: string };
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  className?: string;
  fallbackBgColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const Avatar = React.forwardRef<View, AvatarProps>(
  (
    {
      source,
      name,
      size = 'md',
      variant = 'circular',
      className,
      fallbackBgColor = '#4F46E5',
      showBorder = false,
      borderColor = '#ffffff',
      status,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      xs: { container: 'w-6 h-6', text: 'text-2xs', status: 'w-1.5 h-1.5' },
      sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2' },
      md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5' },
      lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3' },
      xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-3.5 h-3.5' },
      '2xl': { container: 'w-24 h-24', text: 'text-3xl', status: 'w-4 h-4' },
    };

    const variantStyles = {
      circular: 'rounded-full',
      rounded: 'rounded-xl',
      square: 'rounded-lg',
    };

    const statusColors = {
      online: 'bg-success-500',
      offline: 'bg-gray-400',
      away: 'bg-warning-500',
      busy: 'bg-error-500',
    };

    const getInitials = (name: string) => {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const imageSource = typeof source === 'string' ? { uri: source } : source;
    const styles = sizeStyles[size];

    const AvatarContent = () => (
      <View
        className={cn(
          'items-center justify-center overflow-hidden',
          styles.container,
          variantStyles[variant],
          showBorder && 'border-3 border-white shadow-md',
          className
        )}
        style={{ backgroundColor: fallbackBgColor }}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            className="w-full h-full"
            contentFit="cover"
            transition={200}
          />
        ) : name ? (
          <Text className={cn('font-bold text-white', styles.text)}>
            {getInitials(name)}
          </Text>
        ) : (
          <Text className={cn('font-bold text-white', styles.text)}>?</Text>
        )}
      </View>
    );

    return (
      <View ref={ref} className="relative" {...props}>
        <AvatarContent />
        
        {/* Status Indicator */}
        {status && (
          <View
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              styles.status,
              statusColors[status]
            )}
          />
        )}
      </View>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component with enhanced stacking
export interface AvatarGroupProps extends ViewProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

export const AvatarGroup = React.forwardRef<View, AvatarGroupProps>(
  ({ children, max = 3, size = 'md', className, spacing = 'normal', ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayedChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = childArray.length - displayedChildren.length;

    const spacingStyles = {
      tight: '-ml-3',
      normal: '-ml-2',
      loose: '-ml-1',
    };

    return (
      <View
        ref={ref}
        className={cn('flex-row items-center', className)}
        {...props}
      >
        {displayedChildren.map((child, index) => (
          <View
            key={index}
            className={cn(
              index > 0 && spacingStyles[spacing],
              'border-2 border-white rounded-full'
            )}
            style={{ zIndex: displayedChildren.length - index }}
          >
            {child}
          </View>
        ))}
        {remainingCount > 0 && (
          <View className={cn(spacingStyles[spacing], 'border-2 border-white rounded-full')}>
            <Avatar
              name={`+${remainingCount}`}
              size={size}
              fallbackBgColor="#6b7280"
            />
          </View>
        )}
      </View>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// Avatar with Gradient Border
export interface GradientAvatarProps extends AvatarProps {
  gradientColors?: string[];
}

export const GradientAvatar = React.forwardRef<View, GradientAvatarProps>(
  (
    {
      source,
      name,
      size = 'md',
      variant = 'circular',
      gradientColors = ['#4F46E5', '#14B8A6', '#22c55e'],
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      xs: { outer: 28, inner: 24 },
      sm: { outer: 36, inner: 32 },
      md: { outer: 44, inner: 40 },
      lg: { outer: 52, inner: 48 },
      xl: { outer: 68, inner: 64 },
      '2xl': { outer: 100, inner: 96 },
    };

    const sizes = sizeMap[size];
    const imageSource = typeof source === 'string' ? { uri: source } : source;

    return (
      <View ref={ref} {...props}>
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: sizes.outer,
            height: sizes.outer,
            borderRadius: variant === 'circular' ? 9999 : 16,
            padding: 2,
          }}
        >
          <Avatar
            source={source}
            name={name}
            size={size}
            variant={variant}
            showBorder={false}
          />
        </LinearGradient>
      </View>
    );
  }
);

GradientAvatar.displayName = 'GradientAvatar';