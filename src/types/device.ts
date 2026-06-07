// 权限模式类型
export type AppMode = 'normal' | 'shizuku' | 'root';

// 单个信息项
export interface InfoItem {
  key: string;
  label: string;
  value: string;
  detail?: string; // 展开后的详细内容
  requiresPermission?: 'shizuku' | 'root';
}

// 信息分组
export interface InfoSection {
  id: string;
  title: string;
  items: InfoItem[];
}

// 各 Tab 数据
export interface OverviewData {
  brand: string;
  model: string;
  osVersion: string;
  androidVersion: string;
  sdkVersion: string;
  batteryLevel: number;
  isCharging: boolean;
  kernelVersion?: string;
  selinuxStatus?: string;
  accountCount?: number;
}

export interface HardwareData {
  screenWidth: number;
  screenHeight: number;
  screenDensity: number;
  screenRefreshRate: number;
  totalRam: string;
  availRam: string;
  cpuAbi: string;
  cpuFreq?: string[];
  coreCount?: number;
  sensors?: SensorInfo[];
}

export interface SoftwareData {
  installedApps?: AppInfo[];
  runningServices?: ServiceInfo[];
  buildProps?: PropInfo[];
}

export interface NetworkData {
  isWifiConnected: boolean;
  isCellularConnected: boolean;
  ipAddress: string;
  wifiSsid?: string;
  networkStats?: NetworkStats;
}

export interface StorageData {
  totalStorage: string;
  freeStorage: string;
  usedStorage: string;
  usagePercent: number;
  partitions?: PartitionInfo[];
  mountPoints?: MountInfo[];
}

// 子类型
export interface SensorInfo {
  name: string;
  type: string;
  vendor: string;
}

export interface AppInfo {
  name: string;
  packageName: string;
  version: string;
  isSystem: boolean;
}

export interface ServiceInfo {
  name: string;
  pid: string;
  status: string;
}

export interface PropInfo {
  key: string;
  value: string;
}

export interface NetworkStats {
  rxBytes: string;
  txBytes: string;
  connections: number;
}

export interface PartitionInfo {
  name: string;
  size: string;
  type: string;
}

export interface MountInfo {
  device: string;
  mountPoint: string;
  fsType: string;
}
