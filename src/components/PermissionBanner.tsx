import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { GLASS, RADIUS } from '@/lib/design';

interface PermissionBannerProps {
  mode: 'shizuku' | 'root';
}

const CFG = {
  shizuku: {
    title: 'Shizuku 权限未连接',
    desc: '以下数据为演示。实际使用请启动 Shizuku 并授权本应用。',
    color: GLASS.shizuku,
    bg: 'rgba(37,99,235,0.06)',
    border: 'rgba(37,99,235,0.22)',
    highlight: 'rgba(37,99,235,0.35)',
  },
  root: {
    title: 'Root 权限未获取',
    desc: '以下数据为演示。请确认设备已 Root 并授予 su 权限。',
    color: GLASS.root,
    bg: 'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.22)',
    highlight: 'rgba(220,38,38,0.30)',
  },
};

export const PermissionBanner: React.FC<PermissionBannerProps> = ({ mode }) => {
  const c = CFG[mode];
  return (
    <View style={[s.wrap, { backgroundColor: c.bg, borderColor: c.border }]}>
      {/* 顶部高光条 */}
      <View style={[s.topLine, { backgroundColor: c.highlight }]} />
      <View style={s.row}>
        <Lock size={13} color={c.color} style={{ marginTop: 1 }} />
        <View style={s.text}>
          <Text allowFontScaling={false} style={[s.title, { color: c.color }]}>{c.title}</Text>
          <Text allowFontScaling={false} style={s.desc}>{c.desc}</Text>
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
