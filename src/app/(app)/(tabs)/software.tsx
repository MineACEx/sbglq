import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, RefreshControl, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMode } from '@/ctx/modeCtx';
import { GLASS, RADIUS } from '@/lib/design';
import { useEnterAnimation } from '@/lib/useEnterAnimation';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { InfoCard, InfoGroup } from '@/components/InfoCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PermissionBanner } from '@/components/PermissionBanner';
import { TabSkeleton } from '@/components/SkeletonLoader';

export default function SoftwareScreen() {
  const { mode, setMode } = useMode();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // 模拟短暂加载以展示骨架屏
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const g1 = useEnterAnimation(!loading && mode !== 'normal', 0);
  const g2 = useEnterAnimation(!loading && mode !== 'normal', 60);
  const g3 = useEnterAnimation(!loading && mode !== 'normal', 120);

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ModeSwitcher mode={mode} onModeChange={setMode} />
        <TabSkeleton />
      </SafeAreaView>
    );
  }

  if (mode === 'normal') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ModeSwitcher mode={mode} onModeChange={setMode} />
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <Text style={s.emptyEmoji}>📱</Text>
          </View>
          <Text allowFontScaling={false} style={s.emptyTitle}>需要更高权限</Text>
          <Text allowFontScaling={false} style={s.emptyDesc}>
            切换至 Shizuku 或 Root 模式，可查看已安装应用、运行中的服务及系统属性。
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ModeSwitcher mode={mode} onModeChange={setMode} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={GLASS.shizuku} />}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'shizuku' && <PermissionBanner mode="shizuku" />}
        {mode === 'root' && <PermissionBanner mode="root" />}

        <Animated.View style={g1}>
          <SectionHeader title="应用概览" />
          <InfoGroup>
            <InfoCard label="系统应用" value="需要 Shizuku/Root 权限" locked />
            <InfoCard label="用户应用" value="需要 Shizuku/Root 权限" locked />
            <InfoCard label="总计" value="需要 Shizuku/Root 权限" locked last />
          </InfoGroup>
        </Animated.View>

        <Animated.View style={g2}>
          <SectionHeader title="用户应用" />
          <InfoGroup>
            <InfoCard label="应用列表" value="需要连接 Shizuku/Root" locked detail="Expo 没有获取应用列表的 API，需要通过 Shizuku 或 Root 权限调用 PackageManager。" last />
          </InfoGroup>
        </Animated.View>

        <Animated.View style={g2}>
          <SectionHeader title="系统应用" />
          <InfoGroup>
            <InfoCard label="系统应用列表" value="需要连接 Shizuku/Root" locked detail="需要通过 Shizuku 或 Root 权限调用 PackageManager 获取系统应用列表。" last />
          </InfoGroup>
        </Animated.View>

        <Animated.View style={g3}>
          <SectionHeader title="运行中的服务" />
          <InfoGroup>
            <InfoCard label="服务列表" value="需要 Shizuku/Root 权限" locked detail="需要通过 Shizuku 或 Root 权限执行 dumpsys activity services。" last />
          </InfoGroup>
        </Animated.View>

        {mode === 'root' && (
          <Animated.View style={g3}>
            <SectionHeader title="系统属性" />
            <InfoGroup>
              <InfoCard label="Build Props" value="需要 Root 权限" locked detail="需要通过 Root 权限执行 getprop 命令读取系统属性。" last />
            </InfoGroup>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: GLASS.bgTop },
  scroll: { flex: 1 },
  content: { paddingBottom: Platform.OS === 'android' ? 80 : 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIcon: {
    width: 72, height: 72,
    borderRadius: RADIUS['2xl'], borderCurve: 'continuous',
    backgroundColor: GLASS.cardBg,
    borderWidth: 0.8, borderColor: GLASS.borderOuter,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontFamily: 'Glow Sans SC', fontSize: 16, fontWeight: '700', color: GLASS.textPrimary, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Glow Sans SC', fontSize: 14, color: GLASS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
