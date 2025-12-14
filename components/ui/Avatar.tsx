// components/ui/Avatar.tsx
import { cn } from '@/utils/cn';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface AvatarProps extends ViewProps {
  source?: string | { uri: string };
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  className?: string;
  fallbackBgColor?: string;
}

export const Avatar = React.forwardRef<View, AvatarProps>(
  (
    {
      source,
      name,
      size = 'md',
      variant = 'circular',
      className,
      fallbackBgColor = '#4F46E5', // Primary indigo
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
      '2xl': 'w-24 h-24',
    };

    const textSizeStyles = {
      xs: 'text-2xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-xl',
      '2xl': 'text-3xl',
    };

    const variantStyles = {
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      square: 'rounded-none',
    };

    const getInitials = (name: string) => {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const imageSource = typeof source === 'string' ? { uri: source } : source;

    return (
      <View
        ref={ref}
        className={cn(
          'items-center justify-center overflow-hidden',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        style={{ backgroundColor: fallbackBgColor }}
        {...props}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            className="w-full h-full"
            contentFit="cover"
          />
        ) : name ? (
          <Text
            className={cn(
              'font-semibold text-white',
              textSizeStyles[size]
            )}
          >
            {getInitials(name)}
          </Text>
        ) : (
          <Text className={cn('font-semibold text-white', textSizeStyles[size])}>
            ?
          </Text>
        )}
      </View>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
export interface AvatarGroupProps extends ViewProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarGroup = React.forwardRef<View, AvatarGroupProps>(
  ({ children, max = 3, size = 'md', className, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayedChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = childArray.length - displayedChildren.length;

    return (
      <View
        ref={ref}
        className={cn('flex-row items-center', className)}
        {...props}
      >
        {displayedChildren.map((child, index) => (
          <View key={index} className={index > 0 ? '-ml-2' : ''}>
            {child}
          </View>
        ))}
        {remainingCount > 0 && (
          <View className="-ml-2">
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
