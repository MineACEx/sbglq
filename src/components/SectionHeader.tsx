import React from 'react';
import { View, Text } from 'react-native';
import { GLASS } from '@/lib/design';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 24, paddingBottom: 8 }}>
    <Text
      allowFontScaling={false}
      style={{
        fontFamily: 'Glow Sans SC',
        fontSize: 11,
        fontWeight: '700',        // 加重：从 600 → 700
        letterSpacing: 0.9,
        color: GLASS.textSecondary, // 高对比度深灰
        textTransform: 'uppercase',
      }}
    >
      {title}
    </Text>
    {count !== undefined && (
      <Text
        allowFontScaling={false}
        style={{ fontFamily: 'Glow Sans SC', fontSize: 11, color: GLASS.textDisabled }}
      >
        {count} 项
      </Text>
    )}
  </View>
);
