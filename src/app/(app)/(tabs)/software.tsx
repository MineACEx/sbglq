import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMode } from '@/ctx/modeCtx';
import { mockInstalledApps, mockRunningServices, mockBuildProps } from '@/lib/mockData';
import { GLASS, RADIUS } from '@/lib/design';
import { useEnterAnimation } from '@/lib/useEnterAnimation';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { InfoCard, InfoGroup } from '@/components/InfoCard';
import { SectionHeader } from '@/components/SectionHeader';
import { PermissionBanner } from '@/components/PermissionBanner';

export default function SoftwareScreen() {
  const { mode, setMode } = useMode();

  const g1 = useEnterAnimation(mode !== 'normal', 0);
  const g2 = useEnterAnimation(mode !== 'normal', 60);
  const g3 = useEnterAnimation(mode !== 'normal', 120);
  const g4 = useEnterAnimation(mode !== 'normal', 180);

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

  const systemApps = mockInstalledApps.filter((a) => a.isSystem);
  const userApps = mockInstalledApps.filter((a) => !a.isSystem);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ModeSwitcher mode={mode} onModeChange={setMode} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {mode === 'shizuku' && <PermissionBanner mode="shizuku" />}
        {mode === 'root' && <PermissionBanner mode="root" />}

        <Animated.View style={g1}>
          <SectionHeader title="应用概览" />
          <InfoGroup>
            <InfoCard label="系统应用" value={`${systemApps.length} 个`} />
            <InfoCard label="用户应用" value={`${userApps.length} 个`} />
            <InfoCard label="总计" value={`${mockInstalledApps.length} 个`} last />
          </InfoGroup>
        </Animated.View>

        <Animated.View style={g2}>
          <SectionHeader title="用户应用" count={userApps.length} />
          <InfoGroup>
            {userApps.map((app, i) => (
              <InfoCard key={`uapp-${i}`} label={app.name} value={app.version}
                detail={`包名：${app.packageName}\n版本：${app.version}`}
                last={i === userApps.length - 1} />
            ))}
          </InfoGroup>
        </Animated.View>

        <Animated.View style={g3}>
          <SectionHeader title="系统应用" count={systemApps.length} />
          <InfoGroup>
            {systemApps.map((app, i) => (
              <InfoCard key={`sapp-${i}`} label={app.name} value={app.version}
                detail={`包名：${app.packageName}\n版本：${app.version}`}
                last={i === systemApps.length - 1} />
            ))}
          </InfoGroup>
        </Animated.View>

        <Animated.View style={g3}>
          <SectionHeader title="运行中的服务" count={mockRunningServices.length} />
          <InfoGroup>
            {mockRunningServices.map((svc, i) => (
              <InfoCard key={`svc-${i}`} label={svc.name} value={svc.status}
                detail={`PID：${svc.pid}\n状态：${svc.status}`}
                last={i === mockRunningServices.length - 1} />
            ))}
          </InfoGroup>
        </Animated.View>

        {mode === 'root' && (
          <Animated.View style={g4}>
            <SectionHeader title="系统属性" count={mockBuildProps.length} />
            <InfoGroup>
              {mockBuildProps.map((prop, i) => (
                <InfoCard key={`prop-${i}`} label={prop.key.split('.').pop() ?? prop.key}
                  value={prop.value} detail={`键：${prop.key}\n值：${prop.value}`}
                  last={i === mockBuildProps.length - 1} />
              ))}
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
