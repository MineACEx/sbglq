import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, RefreshControl, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMode } from '@/ctx/modeCtx';
import { fetchStorageData } from '@/lib/deviceInfo';
import { fetchRootStorageData, checkRootStatus } from '@/lib/rootDeviceInfo';
import { GLASS, RADIUS } from '@/lib/design';
import { useEnterAnimation } from '@/lib/useEnterAnimation';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { InfoCard, InfoGroup } from '@/components/InfoCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PermissionBanner } from '@/components/PermissionBanner';
import { TabSkeleton } from '@/components/SkeletonLoader';
import type { StorageData, RootStatus } from '@/types/device';

/** 液态玻璃存储进度条 */
function StorageBar({ percent, used, total }: { percent: number; used: string; total: string }) {
  const p = Math.min(100, Math.max(0, percent));
  const fillColor = p > 85 ? GLASS.root : p > 60 ? '#f59e0b' : GLASS.shizuku;

  return (
    <View style={b.wrap}>
      {/* 折射层 */}
      <View style={[StyleSheet.absoluteFill, b.refraction]} pointerEvents="none" />
      {/* 顶部高光 */}
      <View style={b.highlight} pointerEvents="none" />
      {/* 外描边 */}
      <View style={[StyleSheet.absoluteFill, b.border]} pointerEvents="none" />

      <View style={b.header}>
        <Text allowFontScaling={false} style={b.labelTxt}>已用 {used}</Text>
        <Text allowFontScaling={false} style={b.percentTxt}>{p}% / {total}</Text>
      </View>
      <View style={b.track}>
        <View style={[b.fill, { width: `${p}%` as `${number}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

const CARD_R = RADIUS.xl;
const b = StyleSheet.create({
  wrap: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 12,
    backgroundColor: GLASS.cardBg,
    borderRadius: CARD_R, borderCurve: 'continuous',
    padding: 16, position: 'relative', overflow: 'hidden',
  },
  refraction: { borderRadius: CARD_R, borderCurve: 'continuous', backgroundColor: GLASS.refractionBg },
  highlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1.2,
    backgroundColor: GLASS.highlightTop, zIndex: 10,
    borderTopLeftRadius: CARD_R, borderTopRightRadius: CARD_R,
  },
  border: { borderRadius: CARD_R, borderCurve: 'continuous', borderWidth: 0.8, borderColor: GLASS.borderOuter, zIndex: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, position: 'relative', zIndex: 5 },
  labelTxt: { fontFamily: 'Glow Sans SC', fontSize: 13, color: GLASS.textSecondary },
  percentTxt: { fontFamily: 'Glow Sans SC', fontSize: 13, fontWeight: '600', color: GLASS.textPrimary },
  track: {
    height: 6, backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: RADIUS.full, borderCurve: 'continuous', overflow: 'hidden',
    position: 'relative', zIndex: 5,
  },
  fill: { height: '100%', borderRadius: RADIUS.full, borderCurve: 'continuous' },
});

export default function StorageScreen() {
  const { mode, setMode } = useMode();
  const [data, setData] = useState<StorageData | null>(null);
  const [rootStorageData, setRootStorageData] = useState<Partial<StorageData> | null>(null);
  const [rootStatus, setRootStatus] = useState<RootStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const baseData = await fetchStorageData();
      setData(baseData);

      if (mode !== 'normal') {
        const status = await checkRootStatus();
        setRootStatus(status);
        if ((mode === 'root' && status.rootAvailable) || (mode === 'shizuku' && status.shizukuAvailable)) {
          const rData = await fetchRootStorageData();
          setRootStorageData(rData);
        } else {
          setRootStorageData(null);
        }
      } else {
        setRootStatus(null);
        setRootStorageData(null);
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

  const isPermissionConnected =
    mode === 'root'
      ? rootStatus?.rootAvailable === true
      : rootStatus?.shizukuAvailable === true;

  const partitions = rootStorageData?.partitions ?? [];
  const mountPoints = rootStorageData?.mountPoints ?? [];

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
            <SectionHeader title="内部存储" />
            <StorageBar percent={data!.usagePercent} used={data!.usedStorage} total={data!.totalStorage} />
            <InfoGroup>
              <InfoCard label="总容量" value={data!.totalStorage} />
              <InfoCard label="已用空间" value={data!.usedStorage} />
              <InfoCard label="可用空间" value={data!.freeStorage} last />
            </InfoGroup>
          </Animated.View>

          {(mode === 'shizuku' || mode === 'root') && (
            <Animated.View style={g2}>
              <SectionHeader title="分区信息" count={partitions.length} />
              <InfoGroup>
                {isPermissionConnected && partitions.length > 0 ? (
                  partitions.map((part, i) => (
                    <InfoCard
                      key={part.name}
                      label={part.name}
                      value={`${part.size} (${part.type})`}
                      last={i === partitions.length - 1}
                    />
                  ))
                ) : (
                  <InfoCard label="分区详情" value="需要 Root 权限" locked detail="需要通过 Root 权限读取 /proc/partitions。" last />
                )}
              </InfoGroup>

              <SectionHeader title="挂载点" count={mountPoints.length} />
              <InfoGroup>
                {isPermissionConnected && mountPoints.length > 0 ? (
                  mountPoints.map((mp, i) => (
                    <InfoCard
                      key={mp.mountPoint}
                      label={mp.mountPoint}
                      value={`${mp.device} (${mp.fsType})`}
                      last={i === mountPoints.length - 1}
                    />
                  ))
                ) : (
                  <InfoCard label="挂载信息" value="需要 Root 权限" locked detail="需要通过 Root 权限执行 cat /proc/mounts。" last />
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
