import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMode } from '@/ctx/modeCtx';
import { fetchOverviewData } from '@/lib/deviceInfo';
import { mockKernelVersion, mockSelinuxStatus, mockAccountInfo } from '@/lib/mockData';
import { GLASS } from '@/lib/design';
import { useEnterAnimation } from '@/lib/useEnterAnimation';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { InfoCard, InfoGroup } from '@/components/InfoCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PermissionBanner } from '@/components/PermissionBanner';
import { TabSkeleton } from '@/components/SkeletonLoader';
import type { OverviewData } from '@/types/device';

export default function OverviewScreen() {
  const { mode, setMode } = useMode();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const d = await fetchOverviewData();
    setData(d);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const ready = !loading && !!data;
  const g1 = useEnterAnimation(ready, 0);
  const g2 = useEnterAnimation(ready, 60);
  const g3 = useEnterAnimation(ready, 120);
  const g4 = useEnterAnimation(ready, 180);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ModeSwitcher mode={mode} onModeChange={setMode} />
      {!ready ? (
        <TabSkeleton />
      ) : (
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
            <SectionHeader title="设备信息" />
            <InfoGroup>
              <InfoCard label="品牌" value={data!.brand} />
              <InfoCard label="型号" value={data!.model} />
              <InfoCard label="系统版本" value={data!.osVersion} />
              <InfoCard label="Android 版本" value={data!.androidVersion} />
              <InfoCard label="SDK 版本" value={data!.sdkVersion} last />
            </InfoGroup>
          </Animated.View>

          <Animated.View style={g2}>
            <SectionHeader title="电池" />
            <InfoGroup>
              <InfoCard label="电量" value={`${data!.batteryLevel}%`} detail={`当前 ${data!.batteryLevel}%，${data!.isCharging ? '正在充电' : '未充电'}。`} />
              <InfoCard label="充电状态" value={data!.isCharging ? '充电中 ⚡' : '未充电'} last />
            </InfoGroup>
          </Animated.View>

          {(mode === 'shizuku' || mode === 'root') && (
            <Animated.View style={g3}>
              <SectionHeader title="账户" />
              <InfoGroup>
                <InfoCard label="Google 账户" value={`${mockAccountInfo.googleAccounts} 个`} />
                <InfoCard label="总账户数" value={`${mockAccountInfo.totalAccounts} 个`} last />
              </InfoGroup>
            </Animated.View>
          )}

          {mode === 'root' && (
            <Animated.View style={g4}>
              <SectionHeader title="内核" />
              <InfoGroup>
                <InfoCard label="内核版本" value={mockKernelVersion.split(' ')[1] ?? mockKernelVersion} detail={mockKernelVersion} />
                <InfoCard label="SELinux 状态" value={mockSelinuxStatus} detail="Enforcing = 强制执行安全策略，Permissive = 宽容模式。" last />
              </InfoGroup>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: GLASS.bgTop },
  scroll: { flex: 1 },
  content: { paddingBottom: Platform.OS === 'android' ? 80 : 100 },
});
