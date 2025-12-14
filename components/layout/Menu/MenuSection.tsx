// components/layout/Menu/MenuSection.tsx
/**
 * Menu Section Component with Optional Title
 * Pure NativeWind styling - no theme hooks
 */

import { memo, ReactNode } from 'react';
import { Text, View } from 'react-native';

type MenuSectionProps = {
  title?: string;
  children: ReactNode;
};

export const MenuSection = memo(({ title, children }: MenuSectionProps) => {
  return (
    <View className="mb-6">
      {title && (
        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 ml-1">
          {title}
        </Text>
      )}
      <View className="bg-white rounded-2xl p-2 gap-2">{children}</View>
    </View>
  );
});

MenuSection.displayName = 'MenuSection';