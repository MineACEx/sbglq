import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock, ShieldCheck } from 'lucide-react-native';
import { GLASS, RADIUS } from '@/lib/design';
import type { RootStatus } from '@/types/device';

interface PermissionBannerProps {
  mode: 'shizuku' | 'root';
  rootStatus?: RootStatus;
}

const CFG = {
  shizuku: {
    connected: {
      title: 'Shizuku 已连接',
      desc: 'Shizuku 服务运行中，可读取 Shell 级别数据。',
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.06)',
      border: 'rgba(22,163,74,0.22)',
      highlight: 'rgba(22,163,74,0.35)',
    },
    disconnected: {
      title: 'Shizuku 权限未连接',
      desc: '以下数据为演示。实际使用请启动 Shizuku 并授权本应用。',
      color: GLASS.shizuku,
      bg: 'rgba(37,99,235,0.06)',
      border: 'rgba(37,99,235,0.22)',
      highlight: 'rgba(37,99,235,0.35)',
    },
  },
  root: {
    connected: {
      title: 'Root 已授权',
      desc: `Root 权限可用，方案：${'Magisk'}`,
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.06)',
      border: 'rgba(22,163,74,0.22)',
      highlight: 'rgba(22,163,74,0.35)',
    },
    disconnected: {
      title: 'Root 权限未获取',
      desc: '以下数据为演示。请确认设备已 Root 并授予 su 权限。',
      color: GLASS.root,
      bg: 'rgba(220,38,38,0.06)',
      border: 'rgba(220,38,38,0.22)',
      highlight: 'rgba(220,38,38,0.30)',
    },
  },
};

export const PermissionBanner: React.FC<PermissionBannerProps> = ({ mode, rootStatus }) => {
  const isConnected =
    mode === 'root'
      ? rootStatus?.rootAvailable === true
      : rootStatus?.shizukuAvailable === true;

  const cfg = CFG[mode][isConnected ? 'connected' : 'disconnected'];

  // 为 root 已连接状态添加方案信息
  const desc =
    isConnected && mode === 'root' && rootStatus?.rootMethod && rootStatus.rootMethod !== 'unknown'
      ? `Root 权限可用，方案：${rootStatus.rootMethod}`
      : cfg.desc;

  return (
    <View style={[s.wrap, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      {/* 顶部高光条 */}
      <View style={[s.topLine, { backgroundColor: cfg.highlight }]} />
      <View style={s.row}>
        {isConnected ? (
          <ShieldCheck size={13} color={cfg.color} style={{ marginTop: 1 }} />
        ) : (
          <Lock size={13} color={cfg.color} style={{ marginTop: 1 }} />
        )}
        <View style={s.text}>
          <Text allowFontScaling={false} style={[s.title, { color: cfg.color }]}>{cfg.title}</Text>
          <Text allowFontScaling={false} style={s.desc}>{desc}</Text>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 2,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    borderWidth: 0.8,
    overflow: 'hidden',
  },
  topLine: { height: 1, width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  text: { flex: 1 },
  title: {
    fontFamily: 'Glow Sans SC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  desc: {
    fontFamily: 'Glow Sans SC',
    fontSize: 12,
    color: GLASS.textSecondary,
    lineHeight: 17,
  },
});
