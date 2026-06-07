import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GLASS, RADIUS } from '@/lib/design';

// InfoGroup 已整合进 InfoCard.tsx，此文件保留向后兼容导出
export const InfoGroup: React.FC<{ children: React.ReactNode; style?: object }> = ({
  children,
  style,
}) => (
  <View style={[g.wrap, style]}>
    <View style={[StyleSheet.absoluteFill, g.refraction]} pointerEvents="none" />
    <View style={g.highlight} pointerEvents="none" />
    <View style={[StyleSheet.absoluteFill, g.border]} pointerEvents="none" />
    <View style={g.content}>{children}</View>
  </View>
);

const CARD_RADIUS = RADIUS.xl;
const g = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: GLASS.cardBg,
    position: 'relative',
  },
  refraction: {
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    backgroundColor: GLASS.refractionBg,
    zIndex: 1,
  },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1.2,
    backgroundColor: GLASS.highlightTop,
    zIndex: 10,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },
  border: {
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    borderWidth: 0.8,
    borderColor: GLASS.borderOuter,
    zIndex: 20,
  },
  content: { position: 'relative', zIndex: 5 },
});
