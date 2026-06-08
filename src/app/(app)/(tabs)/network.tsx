import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMode } from '@/ctx/modeCtx';
import { fetchNetworkData } from '@/lib/deviceInfo';
import { fetchRootNetworkData, checkRootStatus } from '@/lib/rootDeviceInfo';
import { GLASS } from '@/lib/design';
import { useEnterAnimation } from '@/lib/useEnterAnimation';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { InfoCard, InfoGroup } from '@/components/InfoCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PermissionBanner } from '@/components/PermissionBanner';
import { TabSkeleton } from '@/components/SkeletonLoader';
import type { NetworkData, NetworkStats, RootStatus } from '@/types/device';

export default function NetworkScreen() {
  const { mode, setMode } = useMode();
  const [data, setData] = useState<NetworkData | null>(null);
  const [netStats, setNetStats] = useState<NetworkStats | null>(null);
  const [rootStatus, setRootStatus] = useState<RootStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const baseData = await fetchNetworkData();
      setData(baseData);

      if (mode !== 'normal') {
        const status = await checkRootStatus();
        setRootStatus(status);
        if ((mode === 'root' && status.rootAvailable) || (mode === 'shizuku' && status.shizukuAvailable)) {
          const stats = await fetchRootNetworkData();
          setNetStats(stats);
        } else {
          setNetStats(null);
        }
      } else {
        setRootStatus(null);
        setNetStats(null);
      }
    } catch {
      // 静默处理
    }
    setLoading(false);
  }, [mode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const ready = !loading && !!data;
  const g1 = useEnterAnimation(ready, 0);
  const g2 = useEnterAnimation(ready, 70);

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
            <SectionHeader title="连接状态" />
            <InfoGroup>
              <InfoCard label="WiFi" value={data!.isWifiConnected ? '已连接' : '未连接'}
                detail={data!.isWifiConnected ? 'WiFi 网络已连接。' : 'WiFi 当前未连接。'} />
              <InfoCard label="移动数据" value={data!.isCellularConnected ? '已连接' : '未连接'} />
              <InfoCard label="本地 IP" value={data!.ipAddress}
                detail={`设备在局域网内的 IPv4 地址：${data!.ipAddress}`} />
              <InfoCard label="WiFi 名称" value={data!.wifiSsid ?? '未知'}
                locked={data!.wifiSsid === '需要位置权限'} last />
            </InfoGroup>
          </Animated.View>

          {(mode === 'shizuku' || mode === 'root') && (
            <Animated.View style={g2}>
              <SectionHeader title="网络统计" />
              <InfoGroup>
                {isPermissionConnected && netStats ? (
                  <>
                    <InfoCard label="接收流量" value={netStats.rxBytes}
                      detail="通过 /proc/net/dev 统计的总接收字节数。" />
                    <InfoCard label="发送流量" value={netStats.txBytes}
                      detail="通过 /proc/net/dev 统计的总发送字节数。" />
                    <InfoCard label="活跃连接数" value={`${netStats.connections}`} last />
                  </>
                ) : (
                  <>
                    <InfoCard label="接收流量" value="需要 Shizuku/Root 权限" locked
                      detail="需要通过 Shizuku 或 Root 权限读取 /proc/net/dev。" />
                    <InfoCard label="发送流量" value="需要 Shizuku/Root 权限" locked
                      detail="需要通过 Shizuku 或 Root 权限读取 /proc/net/dev。" />
                    <InfoCard label="活跃连接数" value="需要 Shizuku/Root 权限" locked last />
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
