import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { ChevronDown, Copy, Check } from 'lucide-react-native';
import { GLASS, RADIUS, BLUR_INTENSITY } from '@/lib/design';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface InfoCardProps {
  label: string;
  value: string;
  detail?: string;
  locked?: boolean;
  last?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  detail,
  locked = false,
  last = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyPressed, setCopyPressed] = useState(false);
  const rotation = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    if (!detail && !locked) return;
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 180 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handleCopy = async () => {
    if (locked) return;
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AnimatedPressable onPress={toggle} scaleDown={0.985} haptic style={s.row}>
      <View
        style={[
          s.inner,
          !last && { borderBottomWidth: 0.5, borderBottomColor: GLASS.separator },
        ]}
      >
        {/* 标签：深灰高对比 */}
        <Text allowFontScaling={false} style={s.label} numberOfLines={1}>
          {label}
        </Text>
        {/* 值：接近纯黑 */}
        <Text
          allowFontScaling={false}
          numberOfLines={locked ? 1 : 2}
          style={[s.value, locked && s.valueLocked]}
        >
          {locked ? '需要权限' : value}
        </Text>
        {/* 操作区 */}
        <View style={s.actions}>
          {!locked && (
            <AnimatedPressable
              onPress={handleCopy}
              onPressIn={() => setCopyPressed(true)}
              onPressOut={() => setCopyPressed(false)}
              hitSlop={10}
              scaleDown={0.80}
              haptic={false}
              style={{ opacity: copyPressed ? 0.5 : 1 }}
            >
              {copied ? (
                <Check size={13} color={GLASS.shizuku} />
              ) : (
                <Copy size={13} color={GLASS.textDisabled} />
              )}
            </AnimatedPressable>
          )}
          {(detail || locked) && (
            <Animated.View style={chevronStyle}>
              <ChevronDown size={13} color={locked ? GLASS.textDisabled : '#b0b0ba'} />
            </Animated.View>
          )}
        </View>
      </View>

      {/* 展开详情 */}
      {expanded && !locked && detail && (
        <View style={s.expand}>
          <Text allowFontScaling={false} style={s.expandText}>{detail}</Text>
        </View>
      )}
      {expanded && locked && (
        <View style={s.expand}>
          <Text allowFontScaling={false} style={s.expandText}>
            此功能需要更高权限，请切换对应模式后查看。
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

/** 液态玻璃信息分组容器 — 增强折射效果 */
export const InfoGroup: React.FC<{ children: React.ReactNode; style?: object }> = ({
  children,
  style,
}) => (
  <View style={[g.wrap, style]}>
    {/* 折射色层 — 增强透明度 */}
    <View style={[StyleSheet.absoluteFill, g.refraction]} pointerEvents="none" />
    {/* 顶部高光条 */}
    <View style={g.highlight} pointerEvents="none" />
    {/* 外描边（棱镜边缘） */}
    <View style={[StyleSheet.absoluteFill, g.border]} pointerEvents="none" />
    {/* 内侧细线 — 玻璃厚度感 */}
    <View style={[StyleSheet.absoluteFill, g.innerBorder]} pointerEvents="none" />
    {/* 内容 */}
    <View style={g.content}>{children}</View>
  </View>
);

const s = StyleSheet.create({
  row: { overflow: 'hidden' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontFamily: 'Glow Sans SC',
    fontSize: 13,
    color: GLASS.textSecondary,
    fontWeight: '500',
    width: 116,
    flexShrink: 0,
  },
  value: {
    fontFamily: 'Glow Sans SC',
    fontSize: 13,
    color: GLASS.textPrimary,
    fontWeight: '400',
    flex: 1,
    marginHorizontal: 8,
  },
  valueLocked: {
    color: GLASS.textDisabled,
    fontStyle: 'italic',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expand: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 2,
    backgroundColor: 'rgba(245,246,252,0.80)',
  },
  expandText: {
    fontFamily: 'Glow Sans SC',
    fontSize: 12,
    color: GLASS.textSecondary,
    lineHeight: 18,
  },
});

const CARD_RADIUS = RADIUS.xl;
const g = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: GLASS.cardBg,
    position: 'relative',
  },
  refraction: {
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    backgroundColor: GLASS.refractionBg,
    zIndex: 1,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.2,
    backgroundColor: GLASS.highlightTop,
    zIndex: 10,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },
  border: {
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    borderWidth: 0.8,
    borderColor: GLASS.borderOuter,
    zIndex: 20,
  },
  innerBorder: {
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: GLASS.borderInner,
    zIndex: 19,
    margin: 1.5,
  },
  content: {
    position: 'relative',
    zIndex: 5,
  },
});
