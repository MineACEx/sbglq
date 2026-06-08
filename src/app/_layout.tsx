import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native';
import React from 'react';
import { BlurView } from 'expo-blur';

import { ModeProvider } from '@/ctx/modeCtx';
import { GLASS } from '@/lib/design';
import '../global.css';

/**
 * ColorOS / HyperOS / MIUI 适配：
 * - Android 状态栏设为透明，使用浅色图标
 * - translucent=true 让内容延伸到状态栏下，SafeAreaView 自动补偿
 */
const STATUS_BAR_BG = Platform.OS === 'android' ? 'transparent' : '#EEF2FA';

function RootLayoutNav() {
  const [fontsLoaded] = useFonts({
    'Glow Sans SC': {
      uri: 'https://resource-static.cdn.bcebos.com/fonts/GlowSansSC-Normal-Regular.ttf',
    },
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FA' }}>
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={ls.root}>
      {/* 底层渐变背景 */}
      <View style={ls.bgGradient} pointerEvents="none" />
      {/* 全局高斯模糊层 */}
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={Platform.OS === 'ios' ? 40 : 0}
        tint="extraLight"
      />
      {/* 内容层 */}
      <View style={StyleSheet.absoluteFill}>
        <StatusBar
          style="dark"
          backgroundColor={STATUS_BAR_BG}
          translucent={Platform.OS === 'android'}
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(app)" />
        </Stack>
      </View>
    </View>
  );
}

const RootLayout: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModeProvider>
        <RootLayoutNav />
      </ModeProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;

const ls = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GLASS.bgTop,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GLASS.bgGradientStart,
    // 使用多层半透明叠加模拟渐变
  },
});
