import type {
  AppInfo,
  ServiceInfo,
  NetworkStats,
  PartitionInfo,
  MountInfo,
  SensorInfo,
  PropInfo,
} from '@/types/device';

// ─── Shizuku 模式模拟数据 ───────────────────────────────────────

export const mockInstalledApps: AppInfo[] = [
  { name: '设置', packageName: 'com.android.settings', version: '13.0.0', isSystem: true },
  { name: '相机', packageName: 'com.android.camera2', version: '4.3.020', isSystem: true },
  { name: '拨号', packageName: 'com.android.dialer', version: '12.0.0', isSystem: true },
  { name: '短信', packageName: 'com.android.mms', version: '12.0.0', isSystem: true },
  { name: '文件管理', packageName: 'com.android.documentsui', version: '13.0.0', isSystem: true },
  { name: 'Google Play', packageName: 'com.android.vending', version: '38.1.14', isSystem: true },
  { name: 'Chrome', packageName: 'com.android.chrome', version: '119.0.6045.163', isSystem: false },
  { name: 'YouTube', packageName: 'com.google.android.youtube', version: '18.45.41', isSystem: false },
  { name: 'Termux', packageName: 'com.termux', version: '0.118.0', isSystem: false },
  { name: 'Shizuku', packageName: 'moe.shizuku.privileged.api', version: '13.5.5', isSystem: false },
  { name: 'AIDE', packageName: 'com.aide.ui', version: '3.2.210316', isSystem: false },
  { name: '微信', packageName: 'com.tencent.mm', version: '8.0.43', isSystem: false },
];

export const mockRunningServices: ServiceInfo[] = [
  { name: 'SystemServer', pid: '1234', status: '运行中' },
  { name: 'SurfaceFlinger', pid: '567', status: '运行中' },
  { name: 'InputMethodService', pid: '2341', status: '运行中' },
  { name: 'NetworkLocationService', pid: '3456', status: '运行中' },
  { name: 'AudioService', pid: '1890', status: '运行中' },
  { name: 'WindowManagerService', pid: '1234', status: '运行中' },
  { name: 'PackageManagerService', pid: '1234', status: '运行中' },
];

export const mockNetworkStats: NetworkStats = {
  rxBytes: '1.42 GB',
  txBytes: '356 MB',
  connections: 12,
};

export const mockAccountInfo = {
  googleAccounts: 1,
  totalAccounts: 2,
};

// ─── Root 模式模拟数据 ──────────────────────────────────────────

export const mockKernelVersion =
  'Linux 5.15.123-android13-8-g4d1e7e9f0e2a #1 SMP PREEMPT Mon Oct 16 10:23:45 UTC 2023';

export const mockCpuFrequencies = [
  '1.80 GHz (核心 0-3 · 小核)',
  '2.42 GHz (核心 4-6 · 大核)',
  '3.00 GHz (核心 7 · 超大核)',
];

export const mockCpuCoreCount = 8;

export const mockSelinuxStatus = 'Enforcing';

export const mockPartitions: PartitionInfo[] = [
  { name: 'system', size: '3.5 GB', type: 'ext4' },
  { name: 'vendor', size: '1.2 GB', type: 'ext4' },
  { name: 'data', size: '112 GB', type: 'f2fs' },
  { name: 'cache', size: '256 MB', type: 'ext4' },
  { name: 'boot', size: '64 MB', type: 'raw' },
  { name: 'recovery', size: '64 MB', type: 'raw' },
  { name: 'metadata', size: '16 MB', type: 'ext4' },
  { name: 'persist', size: '32 MB', type: 'ext4' },
];

export const mockMountPoints: MountInfo[] = [
  { device: '/dev/block/dm-0', mountPoint: '/system', fsType: 'ext4' },
  { device: '/dev/block/dm-1', mountPoint: '/vendor', fsType: 'ext4' },
  { device: '/dev/block/sda31', mountPoint: '/data', fsType: 'f2fs' },
  { device: 'tmpfs', mountPoint: '/dev', fsType: 'tmpfs' },
  { device: 'proc', mountPoint: '/proc', fsType: 'proc' },
  { device: 'sysfs', mountPoint: '/sys', fsType: 'sysfs' },
];

export const mockSensors: SensorInfo[] = [
  { name: '加速度计', type: 'TYPE_ACCELEROMETER', vendor: 'BOSCH' },
  { name: '陀螺仪', type: 'TYPE_GYROSCOPE', vendor: 'BOSCH' },
  { name: '磁力计', type: 'TYPE_MAGNETIC_FIELD', vendor: 'AKM' },
  { name: '气压计', type: 'TYPE_PRESSURE', vendor: 'STM' },
  { name: '接近传感器', type: 'TYPE_PROXIMITY', vendor: 'Vishay' },
  { name: '环境光传感器', type: 'TYPE_LIGHT', vendor: 'Liteon' },
  { name: '重力传感器', type: 'TYPE_GRAVITY', vendor: 'BOSCH' },
  { name: '旋转矢量', type: 'TYPE_ROTATION_VECTOR', vendor: 'AOSP' },
  { name: '步行计数器', type: 'TYPE_STEP_COUNTER', vendor: 'Qualcomm' },
  { name: '心率传感器', type: 'TYPE_HEART_RATE', vendor: 'Samsung' },
];

export const mockBuildProps: PropInfo[] = [
  { key: 'ro.build.version.release', value: '13' },
  { key: 'ro.build.date', value: 'Mon Oct 16 10:23:45 CST 2023' },
  { key: 'ro.product.cpu.abi', value: 'arm64-v8a' },
  { key: 'ro.sf.lcd_density', value: '480' },
  { key: 'ro.build.type', value: 'user' },
  { key: 'ro.build.tags', value: 'release-keys' },
  { key: 'persist.sys.timezone', value: 'Asia/Shanghai' },
  { key: 'dalvik.vm.heapsize', value: '512m' },
  { key: 'ro.crypto.state', value: 'encrypted' },
  { key: 'ro.secure', value: '1' },
];
