import * as Device from 'expo-device';
import * as Network from 'expo-network';
import * as Battery from 'expo-battery';
import * as FileSystem from 'expo-file-system';
import { Dimensions, Platform, NativeModules } from 'react-native';
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

  // Android 版本：优先使用 Platform.constants 中的精确值
  const androidVersion =
    Platform.OS === 'android'
      ? (Platform.constants?.Release ?? Platform.Version?.toString() ?? '未知')
      : (Device.osVersion ?? '未知');

  // SDK 版本
  const sdkVersion =
    Platform.OS === 'android'
      ? (Platform.constants?.Version ?? Platform.Version?.toString() ?? '未知')
      : 'N/A';

  return {
    brand: Device.brand ?? '未知',
    model: Device.modelName ?? '未知',
    osVersion: Device.osVersion ?? '未知',
    androidVersion,
    sdkVersion,
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

  // 内存信息
  const totalMem = Device.totalMemory ?? 0;

  // 尝试通过 NativeModules 获取可用内存
  let availRamStr = '需要权限';
  try {
    if (Platform.OS === 'android') {
      // 尝试 expo-device 的 DeviceInfo native module
      const DeviceInfo = NativeModules.DeviceInfo;
      if (DeviceInfo?.getFreeMemory) {
        const freeMem = await DeviceInfo.getFreeMemory();
        if (typeof freeMem === 'number' && freeMem > 0) {
          availRamStr = formatBytes(freeMem);
        }
      }
    }
  } catch {
    // 不可用则保持默认
  }

  // 尝试获取屏幕刷新率
  let refreshRate = 60;
  try {
    if (Platform.OS === 'android') {
      const DisplayMetrics = NativeModules.DisplayMetrics
        ?? NativeModules.UIManager?.getConstants?.DisplayMetrics;
      if (DisplayMetrics?.refreshRate) {
        refreshRate = Math.round(DisplayMetrics.refreshRate);
      }
    }
  } catch {
    // 不可用则保持默认 60Hz
  }

  return {
    screenWidth: Math.round(width * scale),
    screenHeight: Math.round(height * scale),
    screenDensity: Math.round(scale * 160),
    screenRefreshRate: refreshRate,
    totalRam: formatBytes(totalMem),
    availRam: availRamStr,
    cpuAbi: Device.supportedCpuArchitectures?.join(', ') ?? '未知',
  };
}

// 获取网络数据（普通模式）
export async function fetchNetworkData(): Promise<NetworkData> {
  const state = await Network.getNetworkStateAsync().catch(() => null);
  const ip = await Network.getIpAddressAsync().catch(() => '未知');

  // WiFi SSID：expo-network 的 NetworkState 包含 ssid 字段（需要 LOCATION 权限）
  let wifiSsid: string | undefined;
  if (state?.isConnected && state?.type === Network.NetworkStateType.WIFI) {
    // NetworkState 中可能包含 ssid 字段
    wifiSsid = (state as Record<string, unknown>).ssid as string | undefined;
    if (!wifiSsid || wifiSsid === '<unknown ssid>') {
      wifiSsid = '需要位置权限';
    }
  } else if (state?.type === Network.NetworkStateType.WIFI) {
    wifiSsid = (state as Record<string, unknown>).ssid as string | undefined;
    if (!wifiSsid || wifiSsid === '<unknown ssid>') {
      wifiSsid = '需要位置权限';
    }
  } else {
    wifiSsid = undefined;
  }

  return {
    isWifiConnected: state?.type === Network.NetworkStateType.WIFI,
    isCellularConnected: state?.type === Network.NetworkStateType.CELLULAR,
    ipAddress: ip,
    wifiSsid,
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
