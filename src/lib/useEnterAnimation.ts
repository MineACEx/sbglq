/**
 * useEnterAnimation — 数据就绪后触发 FadeIn + SlideUp 进场
 * 支持 stagger（错落延迟）
 */
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SPRING } from '@/lib/design';

/**
 * @param ready 数据就绪标志
 * @param delay 延迟毫秒（用于 stagger）
 */
export function useEnterAnimation(ready: boolean, delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (ready) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 260 }));
      translateY.value = withDelay(delay, withSpring(0, SPRING.enter));
    } else {
      opacity.value = 0;
      translateY.value = 16;
    }
  }, [ready, delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animStyle;
}
