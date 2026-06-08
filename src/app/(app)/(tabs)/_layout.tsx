import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GLASS, BLUR_INTENSITY } from '@/lib/design';

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
        tabBarInactiveTintColor: '#a0a0ab',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios'
            ? 'rgba(248,249,252,0.82)'
            : GLASS.barBg,
          borderTopWidth: 0.8,
          borderTopColor: Platform.OS === 'ios'
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(200,208,224,0.40)',
          height: Platform.OS === 'android' ? 64 : 82,
          paddingBottom: Platform.OS === 'android' ? 10 : 22,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarBackground: () => {
          if (Platform.OS === 'ios') {
            return (
              <BlurView
                intensity={BLUR_INTENSITY.bar}
                tint="extraLight"
                style={StyleSheet.absoluteFill}
              />
            );
          }
          return null;
        },
        tabBarLabelStyle: {
          fontFamily: 'Glow Sans SC',
          fontSize: 10,
          fontWeight: '500',
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
