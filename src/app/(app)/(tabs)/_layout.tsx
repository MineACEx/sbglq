import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GLASS } from '@/lib/design';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const tabs: { name: string; title: string; icon: IoniconsName; iconOutline: IoniconsName }[] = [
  { name: 'overview', title: '概览', icon: 'grid', iconOutline: 'grid-outline' },
  { name: 'hardware', title: '硬件', icon: 'hardware-chip', iconOutline: 'hardware-chip-outline' },
  { name: 'software', title: '软件', icon: 'apps', iconOutline: 'apps-outline' },
  { name: 'network', title: '网络', icon: 'wifi', iconOutline: 'wifi-outline' },
  { name: 'storage', title: '存储', icon: 'server', iconOutline: 'server-outline' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GLASS.shizuku,
        tabBarInactiveTintColor: '#a0a0ab',     // 对比度提升：从 aeaeb2 → a0a0ab
        tabBarStyle: {
          position: 'absolute',
          // 液态玻璃底栏：顶部高光描边模拟折射边缘
          backgroundColor: Platform.OS === 'ios' ? 'rgba(248,249,252,0.88)' : GLASS.barBg,
          borderTopWidth: 0.8,
          borderTopColor: Platform.OS === 'ios'
            ? 'rgba(255,255,255,0.80)'          // iOS：亮白高光边（折射顶面）
            : 'rgba(200,208,224,0.40)',          // Android：浅蓝灰描边
          height: Platform.OS === 'android' ? 64 : 82,
          paddingBottom: Platform.OS === 'android' ? 10 : 22,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Glow Sans SC',
          fontSize: 10,
          fontWeight: '500',                    // 对比度：从 400 → 500
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.icon : tab.iconOutline} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
