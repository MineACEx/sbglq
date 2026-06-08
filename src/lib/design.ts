/**
 * 设计系统常量
 * - iOS 26 液态玻璃（Liquid Glass）：多层折射 + 高光描边
 * - G2 连续圆角（squircle）
 * - 高对比度白色极简
 */

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  full: 9999,
} as const;

/** G2 连续圆角 */
export function g2(radius: number = RADIUS.lg) {
  return {
    borderRadius: radius,
    borderCurve: 'continuous' as const,
  };
}

/**
 * 液态玻璃（Liquid Glass）色彩系统
 *
 * iOS 26 Liquid Glass 原理：
 * 1. 底层磨砂层（BlurView extraLight, intensity 22）—— 让背景虚化但不失真
 * 2. 折射高光层（rgba 白色半透明）—— 模拟玻璃折射的镜面反射
 * 3. 顶层光晕描边（白色渐变边框）—— 边缘棱镜散光
 * 4. 内侧细线（rgba 深色 0.06）—— 玻璃厚度感
 */
export const GLASS = {
  // ── 页面背景 ──────────────────────────────────────
  /** 几乎纯白，液态玻璃需要亮底才能折射 */
  bgTop: '#F5F6FA',
  bgBottom: '#EEEEF4',

  // ── 液态玻璃卡片 ──────────────────────────────────
  /** 卡片主体：白色 + 极轻蓝调，模拟玻璃微折射色散 */
  cardBg: 'rgba(255,255,255,0.72)',
  /** 折射高光覆盖层：偏蓝白，给玻璃增加折射色 */
  refractionBg: 'rgba(232,240,255,0.28)',
  /** 顶部高光条：强反射 */
  highlightTop: 'rgba(255,255,255,0.92)',
  /** 底部暗边：折射导致底部微暗 */
  highlightBottom: 'rgba(210,220,240,0.18)',

  // ── 边缘描边 ──────────────────────────────────────
  /** 外描边：明亮白色，棱镜边缘 */
  borderOuter: 'rgba(255,255,255,0.85)',
  /** 内描边：轻微深色，玻璃厚度 */
  borderInner: 'rgba(180,190,210,0.28)',

  // ── 分隔线 ────────────────────────────────────────
  /** 对比度提升 */
  separator: 'rgba(60,60,67,0.14)',

  // ── 工具栏 ────────────────────────────────────────
  barBg: 'rgba(255,255,255,0.88)',
  activeBg: 'rgba(255,255,255,0.99)',

  // ── 文字（高对比度版） ─────────────────────────────
  /** 主文字：接近纯黑，对比度 ↑ */
  textPrimary: '#0a0a0f',
  /** 次要文字：深灰 */
  textSecondary: '#55555e',
  /** 占位/禁用 */
  textDisabled: '#aeaeb2',

  // ── 阴影 ──────────────────────────────────────────
  shadow: 'rgba(0,0,0,0.06)',

  // ── 品牌色 ────────────────────────────────────────
  shizuku: '#2563eb',
  root: '#dc2626',

  // ── 全局背景模糊 ───────────────────────────────────
  /** 背景渐变起始色 */
  bgGradientStart: '#E8ECF8',
  /** 背景渐变结束色 */
  bgGradientEnd: '#F0F2FA',
} as const;

/** BlurView 强度 —— 液态玻璃用低强度保持通透 */
export const BLUR_INTENSITY = {
  /** 主卡片：低强度磨砂，通透感更强 */
  card: 28,
  /** 工具栏：稍高保持遮蔽性 */
  bar: 52,
  overlay: 24,
  /** 全局背景模糊 */
  background: 40,
} as const;

/** 动画弹簧配置 */
export const SPRING = {
  /** 点击弹性：快速响应 */
  press: { damping: 15, stiffness: 400, mass: 0.6 },
  /** 进场弹性：自然落下 */
  enter: { damping: 22, stiffness: 280, mass: 0.8 },
} as const;
