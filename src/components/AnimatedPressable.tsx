/**
 * AnimatedPressable — 带 spring 弹性缩放的点击组件
 * - scale: 1 → 0.96 → 1（spring 回弹）
 * - iOS：ImpactFeedbackStyle.Light 触觉反馈
 * - Android：Ripple 涟漪（自然平台风格）
 */
import React, { useCallback } from 'react';
import { Platform, Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SPRING } from '@/lib/design';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  /** 按下时的缩放比例，默认 0.96 */
  scaleDown?: number;
  /** 是否开启触觉反馈（默认 true，iOS 专用） */
  haptic?: boolean;
  style?: object | object[];
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  scaleDown = 0.96,
  haptic = true,
  onPress,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleDown, SPRING.press);
    if (haptic && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [scale, scaleDown, haptic]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.press);
  }, [scale]);

  return (
    <AnimatedPressableBase
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)', borderless: false } : undefined}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
};
