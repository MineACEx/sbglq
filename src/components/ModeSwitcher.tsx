import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import type { AppMode } from '@/types/device';
import { GLASS, RADIUS, BLUR_INTENSITY } from '@/lib/design';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface ModeSwitcherProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const MODES: { key: AppMode; label: string; activeColor: string }[] = [
  { key: 'normal',  label: '普通',    activeColor: GLASS.textPrimary },
  { key: 'shizuku', label: 'Shizuku', activeColor: GLASS.shizuku },
  { key: 'root',    label: 'Root',    activeColor: GLASS.root },
];

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  const Track = Platform.OS === 'ios' ? BlurView : View;
  const trackProps = Platform.OS === 'ios'
    ? { intensity: BLUR_INTENSITY.bar, tint: 'extraLight' as const }
    : {};

  return (
    <View style={s.wrapper}>
      <Track {...trackProps} style={[s.track, Platform.OS === 'android' && s.androidTrack]}>
        {/* 折射层 */}
        <View style={[StyleSheet.absoluteFill, s.trackRefraction]} pointerEvents="none" />
        {/* 顶部高光 */}
        <View style={s.trackHighlight} pointerEvents="none" />

        {MODES.map((m) => {
          const active = mode === m.key;
          return (
            <AnimatedPressable
              key={m.key}
              onPress={() => onModeChange(m.key)}
              scaleDown={0.94}
              haptic
              style={s.tabWrap}
            >
              <View style={[s.tab, active && s.activeTab]}>
                {/* 选中态：液态玻璃小胶囊 */}
                {active && (
                  <>
                    <View style={[StyleSheet.absoluteFill, s.activeBase]} />
                    <View style={[StyleSheet.absoluteFill, s.activeRefraction]} />
                    <View style={s.activeHighlight} />
                    <View style={[StyleSheet.absoluteFill, s.activeBorder]} />
                  </>
                )}
                <Text
                  allowFontScaling={false}
                  style={[s.label, { color: active ? m.activeColor : GLASS.textDisabled }]}
                >
                  {m.label}
                </Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </Track>
    </View>
  );
};

const TRACK_R = RADIUS.lg;
const TAB_R = RADIUS.md;

const s = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  track: {
    flexDirection: 'row',
    borderRadius: TRACK_R,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 3,
    backgroundColor: 'rgba(120,120,128,0.10)',
    borderWidth: 0.5,
    borderColor: 'rgba(120,120,128,0.16)',
    position: 'relative',
  },
  androidTrack: { backgroundColor: 'rgba(238,240,248,0.90)' },
  trackRefraction: {
    borderRadius: TRACK_R,
    backgroundColor: 'rgba(220,230,255,0.08)',
  },
  trackHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderTopLeftRadius: TRACK_R,
    borderTopRightRadius: TRACK_R,
    zIndex: 10,
  },
  tabWrap: { flex: 1 },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: TAB_R,
    borderCurve: 'continuous',
    overflow: 'hidden',
    position: 'relative',
  },
  activeTab: {},
  // 选中态：液态玻璃胶囊四层
  activeBase: {
    borderRadius: TAB_R,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  activeRefraction: {
    borderRadius: TAB_R,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(228,238,255,0.18)',
  },
  activeHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: TAB_R,
    borderTopRightRadius: TAB_R,
    zIndex: 10,
  },
  activeBorder: {
    borderRadius: TAB_R,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.75)',
    zIndex: 15,
  },
  label: {
    fontFamily: 'Glow Sans SC',
    fontSize: 13,
    fontWeight: '600',
    position: 'relative',
    zIndex: 20,
  },
});
