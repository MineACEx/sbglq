import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMode } from '@/ctx/modeCtx';
import { fetchHardwareData } from '@/lib/deviceInfo';
import { fetchRootHardwareData, checkRootStatus } from '@/lib/rootDeviceInfo';
import { GLASS } from '@/lib/design';
import { useEnterAnimation } from '@/lib/useEnterAnimation';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { InfoCard, InfoGroup } from '@/components/InfoCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PermissionBanner } from '@/components/PermissionBanner';
import { TabSkeleton } from '@/components/SkeletonLoader';
import type { HardwareData, RootStatus } from '@/types/device';

export default function HardwareScreen() {
  const { mode, setMode } = useMode();
  const [data, setData] = useState<HardwareData | null>(null);
  const [rootData, setRootData] = useState<Partial<HardwareData> | null>(null);
  const [rootStatus, setRootStatus] = useState<RootStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const baseData = await fetchHardwareData();
      setData(baseData);

      if (mode !== 'normal') {
        const status = await checkRootStatus();
        setRootStatus(status);
        if ((mode === 'root' && status.rootAvailable) || (mode === 'shizuku' && status.shizukuAvailable)) {
          const rData = await fetchRootHardwareData();
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
            <SectionHeader title="显示屏" />
            <InfoGroup>
              <InfoCard label="物理分辨率" value={`${data!.screenWidth} x ${data!.screenHeight}`} detail="屏幕的实际像素分辨率（宽 x 高）。" />
              <InfoCard label="屏幕密度" value={`${data!.screenDensity} dpi`} detail="每英寸的像素点数，数值越高显示越细腻。" />
              <InfoCard label="刷新率" value={`${data!.screenRefreshRate} Hz`} detail="屏幕每秒刷新次数。高刷机型需 Root 读取。" last />
            </InfoGroup>
          </Animated.View>

          <Animated.View style={g2}>
            <SectionHeader title="内存 (RAM)" />
            <InfoGroup>
              <InfoCard label="总内存" value={data!.totalRam} />
              <InfoCard
                label="可用内存"
                value={isPermissionConnected && rootData?.availRam && rootData.availRam !== '未知'
                  ? rootData.availRam
                  : data!.availRam === '需要权限'
                    ? '需要权限'
                    : data!.availRam}
                locked={!isPermissionConnected || data!.availRam === '需要权限'}
                last
              />
            </InfoGroup>
          </Animated.View>

          <Animated.View style={g3}>
            <SectionHeader title="处理器 (CPU)" />
            <InfoGroup>
              <InfoCard label="CPU 架构" value={data!.cpuAbi} detail="设备支持的 CPU 指令集，arm64-v8a 为 64 位 ARM 架构。" />
              {isPermissionConnected && rootData?.coreCount ? (
                <>
                  <InfoCard label="核心数量" value={`${rootData.coreCount} 核`} detail="通过 /proc/cpuinfo 读取到的处理器核心数。" last />
                </>
              ) : (
                <>
                  <InfoCard label="核心数量" value="需要权限" locked detail="需要通过 Root 权限读取 /sys/devices/system/cpu。" last />
                </>
              )}
            </InfoGroup>
          </Animated.View>

          <Animated.View style={g4}>
            <SectionHeader title="传感器" />
            <InfoGroup>
              {isPermissionConnected && rootData?.sensors && rootData.sensors.length > 0 ? (
                rootData.sensors.slice(0, 8).map((sensor, i) => (
                  <InfoCard
                    key={sensor.name}
                    label={sensor.name}
                    value={`${sensor.type} - ${sensor.vendor}`}
                    last={i === rootData.sensors!.slice(0, 8).length - 1}
                  />
                ))
              ) : (
                <InfoCard label="传感器列表" value="需要权限" locked detail="需要通过 Root 权限读取 /sys/class/sensors 或调用 SensorService。" last />
              )}
            </InfoGroup>
          </Animated.View>
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
