/**
 * LiquidGlassCard — iOS 26 液态玻璃容器
 *
 * 四层结构（从底到顶）：
 *  Layer 1: BlurView extraLight / 低强度（22）—— 背景磨砂，保持通透
 *  Layer 2: 折射色散层 rgba(232,240,255,0.22) —— 玻璃折射微蓝偏色
 *  Layer 3: 顶部高光条 rgba(255,255,255,0.90) —— 棱镜顶面强反射
 *  Layer 4: 外描边 rgba(255,255,255,0.82) —— 边缘棱镜散光
 *
 * Android（ColorOS/HyperOS）: 半透明白 + 折射色层 fallback，无 BlurView
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { GLASS, BLUR_INTENSITY, RADIUS } from '@/lib/design';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  radius?: number;
  intensity?: number;
  style?: object;
  /** 显示顶部高光条（默认 true） */
  showHighlight?: boolean;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  radius = RADIUS.xl,
  intensity = BLUR_INTENSITY.card,
  style,
  showHighlight = true,
}) => {
  const br = { borderRadius: radius, borderCurve: 'continuous' as const };

  // ── Android Fallback ──────────────────────────────────────────────
  if (Platform.OS === 'android') {
    return (
      <View style={[s.wrap, br, style]}>
        {/* Layer 1: 不透明白色基底 */}
        <View style={[StyleSheet.absoluteFill, s.androidBase, br]} />
        {/* Layer 2: 折射微蓝层 */}
        <View style={[StyleSheet.absoluteFill, s.refraction, br]} />
        {/* 顶部高光条 */}
        {showHighlight && <View style={[s.highlightBar, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} />}
        {/* 外描边 */}
        <View style={[StyleSheet.absoluteFill, s.outerBorder, br]} pointerEvents="none" />
        <View style={s.content}>{children}</View>
      </View>
    );
  }

  // ── iOS: 真实 BlurView 液态玻璃 ───────────────────────────────────
  return (
    <View style={[s.wrap, br, style]}>
      {/* Layer 1: BlurView 磨砂底层 */}
      <BlurView
        intensity={intensity}
        tint="extraLight"
        style={[StyleSheet.absoluteFill, br]}
      />
      {/* Layer 2: 折射色散层 —— 玻璃微蓝偏色 */}
      <View style={[StyleSheet.absoluteFill, s.refraction, br]} />
      {/* Layer 3: 顶部高光强反射条 */}
      {showHighlight && (
        <View style={[s.highlightBar, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} />
      )}
      {/* Layer 4: 外描边 棱镜边缘散光 */}
      <View style={[StyleSheet.absoluteFill, s.outerBorder, br]} pointerEvents="none" />
      {/* 内容层 */}
      <View style={s.content}>{children}</View>
    </View>
  );
};

const s = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  androidBase: {
    backgroundColor: GLASS.cardBg,
  },
  refraction: {
    backgroundColor: GLASS.refractionBg,
  },
  highlightBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.2,
    backgroundColor: GLASS.highlightTop,
    zIndex: 10,
  },
  outerBorder: {
    borderWidth: 0.8,
    borderColor: GLASS.borderOuter,
    // 内侧再加一圈暗线增加玻璃厚度感（通过 boxShadow inset 模拟）
    boxShadow: [
      { offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: -0.5, color: GLASS.borderInner, inset: true },
    ],
  },
  content: {
    position: 'relative',
    zIndex: 5,
  },
});

// 向后兼容旧名称
export { LiquidGlassCard as GlassCard };

