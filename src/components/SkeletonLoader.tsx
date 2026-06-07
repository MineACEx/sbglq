/**
 * SkeletonLoader — 骨架屏加载占位
 * 使用 Reanimated loop 实现呼吸动画（shimmer）
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GLASS, RADIUS } from '@/lib/design';

// 单条骨架行
export function SkeletonLine({ width = '100%', height = 13, style }: { width?: number | `${number}%`; height?: number; style?: object }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: RADIUS.xs,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(120,120,128,0.13)',
        },
        animStyle,
        style,
      ]}
    />
  );
}

// 骨架卡片组：模拟 InfoGroup 外观
export function SkeletonGroup({ rows = 3 }: { rows?: number }) {
  return (
    <View style={sk.group}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[sk.row, i < rows - 1 && sk.rowBorder]}>
          <SkeletonLine width="30%" height={12} />
          <View style={sk.spacer} />
          <SkeletonLine width="45%" height={12} />
        </View>
      ))}
    </View>
  );
}

// 完整骨架屏（用于 Tab 页加载中状态）
export function TabSkeleton() {
  return (
    <View style={sk.container}>
      {/* 标题行 */}
      <View style={sk.headerRow}>
        <SkeletonLine width="22%" height={10} />
      </View>
      <SkeletonGroup rows={5} />

      <View style={sk.headerRow}>
        <SkeletonLine width="15%" height={10} />
      </View>
      <SkeletonGroup rows={2} />

      <View style={sk.headerRow}>
        <SkeletonLine width="18%" height={10} />
      </View>
      <SkeletonGroup rows={3} />
    </View>
  );
}

const sk = StyleSheet.create({
  container: { flex: 1, paddingTop: 4 },
  headerRow: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 8 },
  group: {
    marginHorizontal: 16,
    backgroundColor: GLASS.cardBg,
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 0.8,
    borderColor: GLASS.borderOuter,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: GLASS.separator,
  },
  spacer: { flex: 1 },
});
