/**
 * 国内 ROM 深度适配工具
 *
 * 覆盖厂商：ColorOS (OPPO/OnePlus/realme)、HyperOS/MIUI (Xiaomi)、
 *          OriginOS (vivo)、MagicUI/EMUI (Honor/Huawei)
 *
 * 核心问题：
 * 1. 字体缩放：ROM 全局字体缩放会破坏布局 → allowFontScaling={false} + fontScale 警告
 * 2. 状态栏遮挡：部分 ROM 状态栏高度异常，SafeAreaView edges={['top']} 已覆盖
 * 3. 导航栏：软导航/手势导航高度不固定 → 使用 useSafeAreaInsets 动态获取
 * 4. 圆角渲染：Android 不支持 borderCurve='continuous'（会被忽略，不会崩溃）
 * 5. ColorOS 双阴影：elevation 与 boxShadow 叠加 → elevation: 0 关闭系统阴影
 * 6. HyperOS 全面屏手势：导航条遮挡底部 → 通过 insets.bottom 补偿
 */
import { Platform, PixelRatio } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** 是否为 Android */
export const IS_ANDROID = Platform.OS === 'android';

/** 获取底部安全区高度（含导航栏/手势条，适配所有国内 ROM） */
export function useBottomInset() {
  const insets = useSafeAreaInsets();
  // HyperOS/ColorOS 手势导航时 bottom 可能为 0，至少保留 16
  return Math.max(insets.bottom, IS_ANDROID ? 16 : 0);
}

/** 获取顶部安全区高度 */
export function useTopInset() {
  const insets = useSafeAreaInsets();
  return insets.top;
}

/**
 * 检测字体缩放是否过大（超过 1.1 则 ROM 开启了大字体模式）
 * 在 dev 环境输出警告；生产环境静默处理。
 */
export function checkFontScale() {
  if (!IS_ANDROID) return;
  const scale = PixelRatio.getFontScale();
  if (__DEV__ && scale > 1.1) {
    console.warn(
      `[ROM适配] 检测到系统字体缩放 ${scale.toFixed(2)}x，` +
      '已对全部 Text 设置 allowFontScaling={false}，布局不受影响。'
    );
  }
}

/**
 * Android 卡片样式：关闭 elevation（ColorOS 双阴影问题）
 * 使用 boxShadow 替代 elevation 实现统一阴影效果
 */
export const ANDROID_CARD_STYLE = IS_ANDROID
  ? {
      elevation: 0, // 禁用系统阴影，防止 ColorOS 出现双层阴影
    }
  : {};

/**
 * ScrollView 底部安全内边距
 * Tab 栏为 position:'absolute'，需要手动补偿
 * Android 64px tab bar + 16px margin；iOS 80px
 */
export const SCROLL_BOTTOM_PADDING = IS_ANDROID ? 88 : 104;
