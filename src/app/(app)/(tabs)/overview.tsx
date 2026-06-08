import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMode } from '@/ctx/modeCtx';
import { fetchOverviewData } from '@/lib/deviceInfo';
import { fetchRootOverviewData, checkRootStatus } from '@/lib/rootDeviceInfo';
import { GLASS } from '@/lib/design';
import { useEnterAnimation } from '@/lib/useEnterAnimation';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { InfoCard, InfoGroup } from '@/components/InfoCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PermissionBanner } from '@/components/PermissionBanner';
import { TabSkeleton } from '@/components/SkeletonLoader';
import type { OverviewData, RootStatus } from '@/types/device';

export default function OverviewScreen() {
  const { mode, setMode } = useMode();
  const [data, setData] = useState<OverviewData | null>(null);
  const [rootData, setRootData] = useState<Partial<OverviewData> | null>(null);
  const [rootStatus, setRootStatus] = useState<RootStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 始终加载普通模式数据
      const baseData = await fetchOverviewData();
      setData(baseData);

      // 如果是 shizuku/root 模式，同时检测权限并加载 root 数据
      if (mode !== 'normal') {
        const status = await checkRootStatus();
        setRootStatus(status);
        if ((mode === 'root' && status.rootAvailable) || (mode === 'shizuku' && status.shizukuAvailable)) {
          const rData = await fetchRootOverviewData();
          setRootData(rData);
        } else {
          setRootData(null);
        }
      } else {
        setRootStatus(null);
        setRootData(null);
      }
    } catch {
      // 静默处理
    }
    setLoading(false);
  }, [mode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const ready = !loading && !!data;
  const g1 = useEnterAnimation(ready, 0);
  const g2 = useEnterAnimation(ready, 60);
  const g3 = useEnterAnimation(ready, 120);
  const g4 = useEnterAnimation(ready, 180);

  // 判断 shizuku/root 是否实际连接
  const isPermissionConnected =
    mode === 'root'
      ? rootStatus?.rootAvailable === true
      : rootStatus?.shizukuAvailable === true;

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
          {mode === 'shizuku' && <PermissionBanner mode="shizuku" rootStatus={rootStatus ?? undefined} />}
          {mode === 'root' && <PermissionBanner mode="root" rootStatus={rootStatus ?? undefined} />}

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
              <InfoCard label="充电状态" value={data!.isCharging ? '充电中' : '未充电'} last />
            </InfoGroup>
          </Animated.View>

          {(mode === 'shizuku' || mode === 'root') && (
            <Animated.View style={g3}>
              <SectionHeader title="账户" />
              <InfoGroup>
                {isPermissionConnected && rootData?.accountInfo ? (
                  <>
                    <InfoCard label="Google 账户" value={`${rootData.accountInfo.google} 个`} />
                    <InfoCard label="总账户数" value={`${rootData.accountInfo.total} 个`} last />
                  </>
                ) : (
                  <>
                    <InfoCard label="Google 账户" value="需要 Shizuku/Root 权限" locked />
                    <InfoCard label="总账户数" value="需要 Shizuku/Root 权限" locked last />
                  </>
                )}
              </InfoGroup>
            </Animated.View>
          )}

          {mode === 'root' && (
            <Animated.View style={g4}>
              <SectionHeader title="内核" />
              <InfoGroup>
                {isPermissionConnected && rootData?.kernelVersion ? (
                  <>
                    <InfoCard label="内核版本" value={rootData.kernelVersion} detail={`Linux ${rootData.kernelVersion}`} />
                    <InfoCard label="SELinux 状态" value={rootData.selinuxStatus ?? '未知'} last />
                  </>
                ) : (
                  <>
                    <InfoCard label="内核版本" value="需要 Root 权限" locked detail="需要通过 Root 权限读取 /proc/version。" />
                    <InfoCard label="SELinux 状态" value="需要 Root 权限" locked detail="需要通过 Root 权限执行 getenforce 命令。" last />
                  </>
                )}
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
