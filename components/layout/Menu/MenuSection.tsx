// components/layout/Menu/MenuSection.tsx
/**
 * Enhanced Menu Section Component with Optional Title
 * Modern design with refined spacing and styling
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
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">
          {title}
        </Text>
      )}
      <View className="bg-transparent gap-2">{children}</View>
    </View>
  );
});

MenuSection.displayName = 'MenuSection';