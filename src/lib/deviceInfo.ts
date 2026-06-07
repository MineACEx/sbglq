import * as Device from 'expo-device';
import * as Network from 'expo-network';
import * as Battery from 'expo-battery';
import * as FileSystem from 'expo-file-system';
import { Dimensions, Platform } from 'react-native';
import type {
  OverviewData,
  HardwareData,
  NetworkData,
  StorageData,
} from '@/types/device';

// 字节转人类可读
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '未知';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

// 获取概览数据（普通模式）
export async function fetchOverviewData(): Promise<OverviewData> {
  const batteryLevel = await Battery.getBatteryLevelAsync().catch(() => -1);
  const batteryState = await Battery.getBatteryStateAsync().catch(
    () => Battery.BatteryState.UNKNOWN
  );

  return {
    brand: Device.brand ?? '未知',
    model: Device.modelName ?? '未知',
    osVersion: Device.osVersion ?? '未知',
    androidVersion: Platform.Version?.toString() ?? '未知',
    sdkVersion: Platform.Version?.toString() ?? '未知',
    batteryLevel: Math.round((batteryLevel < 0 ? 0 : batteryLevel) * 100),
    isCharging:
      batteryState === Battery.BatteryState.CHARGING ||
      batteryState === Battery.BatteryState.FULL,
  };
}

// 获取硬件数据（普通模式）
export async function fetchHardwareData(): Promise<HardwareData> {
  const { width, height } = Dimensions.get('screen');
  const scale = Dimensions.get('screen').scale;

  // 内存信息（expo-device 提供总量，但不提供可用量）
  const totalMem = Device.totalMemory ?? 0;

  return {
    screenWidth: Math.round(width * scale),
    screenHeight: Math.round(height * scale),
    screenDensity: Math.round(scale * 160),
    screenRefreshRate: 60, // Expo 无公开 API，默认显示 60Hz
    totalRam: formatBytes(totalMem),
    availRam: '需要权限', // 需要系统权限
    cpuAbi: Device.supportedCpuArchitectures?.join(', ') ?? '未知',
  };
}

// 获取网络数据（普通模式）
export async function fetchNetworkData(): Promise<NetworkData> {
  const state = await Network.getNetworkStateAsync().catch(() => null);
  const ip = await Network.getIpAddressAsync().catch(() => '未知');

  return {
    isWifiConnected: state?.type === Network.NetworkStateType.WIFI,
    isCellularConnected: state?.type === Network.NetworkStateType.CELLULAR,
    ipAddress: ip,
    wifiSsid: '需要位置权限',
  };
}

// 获取存储数据（普通模式）
export async function fetchStorageData(): Promise<StorageData> {
  const info = await FileSystem.getFreeDiskStorageAsync().catch(() => 0);
  const total = await FileSystem.getTotalDiskCapacityAsync().catch(() => 0);
  const used = total - info;
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return {
    totalStorage: formatBytes(total),
    freeStorage: formatBytes(info),
    usedStorage: formatBytes(used),
    usagePercent: percent,
  };
}
