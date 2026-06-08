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
import { fetchRootSoftwareData, checkRootStatus } from '@/lib/rootDeviceInfo';
import type { SoftwareData, RootStatus } from '@/types/device';

export default function SoftwareScreen() {
  const { mode, setMode } = useMode();
  const [softwareData, setSoftwareData] = useState<SoftwareData | null>(null);
  const [rootStatus, setRootStatus] = useState<RootStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (mode !== 'normal') {
        const status = await checkRootStatus();
        setRootStatus(status);
        if ((mode === 'root' && status.rootAvailable) || (mode === 'shizuku' && status.shizukuAvailable)) {
          const sData = await fetchRootSoftwareData();
          setSoftwareData(sData);
        } else {
          setSoftwareData(null);
        }
      } else {
        setRootStatus(null);
        setSoftwareData(null);
      }
    } catch {
      // 静默处理
    }
    setLoading(false);
  }, [mode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isPermissionConnected =
    mode === 'root'
      ? rootStatus?.rootAvailable === true
      : rootStatus?.shizukuAvailable === true;

  const apps = softwareData?.installedApps ?? [];
  const systemApps = apps.filter((a) => a.isSystem);
  const userApps = apps.filter((a) => !a.isSystem);
  const services = softwareData?.runningServices ?? [];
  const props = softwareData?.buildProps ?? [];

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
        {mode === 'shizuku' && <PermissionBanner mode="shizuku" rootStatus={rootStatus ?? undefined} />}
        {mode === 'root' && <PermissionBanner mode="root" rootStatus={rootStatus ?? undefined} />}

        {isPermissionConnected && softwareData ? (
          <>
            <Animated.View style={useEnterAnimation(true, 0)}>
              <SectionHeader title="应用概览" count={apps.length} />
              <InfoGroup>
                <InfoCard label="系统应用" value={`${systemApps.length} 个`} />
                <InfoCard label="用户应用" value={`${userApps.length} 个`} />
                <InfoCard label="总计" value={`${apps.length} 个`} last />
              </InfoGroup>
            </Animated.View>

            <Animated.View style={useEnterAnimation(true, 60)}>
              <SectionHeader title="用户应用" count={userApps.length} />
              <InfoGroup>
                {userApps.slice(0, 15).map((app, i) => (
                  <InfoCard
                    key={app.packageName}
                    label={app.name}
                    value={app.packageName}
                    last={i === Math.min(userApps.length, 15) - 1}
                  />
                ))}
                {userApps.length > 15 && (
                  <InfoCard label="更多" value={`还有 ${userApps.length - 15} 个应用...`} last />
                )}
              </InfoGroup>
            </Animated.View>

            <Animated.View style={useEnterAnimation(true, 120)}>
              <SectionHeader title="系统应用" count={systemApps.length} />
              <InfoGroup>
                {systemApps.slice(0, 10).map((app, i) => (
                  <InfoCard
                    key={app.packageName}
                    label={app.name}
                    value={app.packageName}
                    last={i === Math.min(systemApps.length, 10) - 1}
                  />
                ))}
                {systemApps.length > 10 && (
                  <InfoCard label="更多" value={`还有 ${systemApps.length - 10} 个系统应用...`} last />
                )}
              </InfoGroup>
            </Animated.View>

            <Animated.View style={useEnterAnimation(true, 180)}>
              <SectionHeader title="运行中的服务" count={services.length} />
              <InfoGroup>
                {services.slice(0, 15).map((svc, i) => (
                  <InfoCard
                    key={`${svc.name}-${svc.pid}`}
                    label={svc.name}
                    value={`PID: ${svc.pid}`}
                    last={i === Math.min(services.length, 15) - 1}
                  />
                ))}
                {services.length > 15 && (
                  <InfoCard label="更多" value={`还有 ${services.length - 15} 个服务...`} last />
                )}
              </InfoGroup>
            </Animated.View>

            {mode === 'root' && props.length > 0 && (
              <Animated.View style={useEnterAnimation(true, 240)}>
                <SectionHeader title="系统属性" count={props.length} />
                <InfoGroup>
                  {props.slice(0, 20).map((prop, i) => (
                    <InfoCard
                      key={prop.key}
                      label={prop.key}
                      value={prop.value}
                      last={i === Math.min(props.length, 20) - 1}
                    />
                  ))}
                </InfoGroup>
              </Animated.View>
            )}
          </>
        ) : (
          <>
            <Animated.View style={useEnterAnimation(true, 0)}>
              <SectionHeader title="应用概览" />
              <InfoGroup>
                <InfoCard label="系统应用" value="需要 Shizuku/Root 权限" locked />
                <InfoCard label="用户应用" value="需要 Shizuku/Root 权限" locked />
                <InfoCard label="总计" value="需要 Shizuku/Root 权限" locked last />
              </InfoGroup>
            </Animated.View>

            <Animated.View style={useEnterAnimation(true, 60)}>
              <SectionHeader title="用户应用" />
              <InfoGroup>
                <InfoCard label="应用列表" value="需要连接 Shizuku/Root" locked detail="Expo 没有获取应用列表的 API，需要通过 Shizuku 或 Root 权限调用 PackageManager。" last />
              </InfoGroup>
            </Animated.View>

            <Animated.View style={useEnterAnimation(true, 120)}>
              <SectionHeader title="运行中的服务" />
              <InfoGroup>
                <InfoCard label="服务列表" value="需要 Shizuku/Root 权限" locked detail="需要通过 Shizuku 或 Root 权限执行 ps -A。" last />
              </InfoGroup>
            </Animated.View>

            {mode === 'root' && (
              <Animated.View style={useEnterAnimation(true, 180)}>
                <SectionHeader title="系统属性" />
                <InfoGroup>
                  <InfoCard label="Build Props" value="需要 Root 权限" locked detail="需要通过 Root 权限执行 getprop 命令读取系统属性。" last />
                </InfoGroup>
              </Animated.View>
            )}
          </>
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
