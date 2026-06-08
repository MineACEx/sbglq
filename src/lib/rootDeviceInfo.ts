/**
 * rootDeviceInfo — Root/Shizuku 权限下的真实设备数据获取层
 *
 * 所有函数通过 NativeShell 模块执行 Shell 命令获取数据。
 * - Root 模式：使用 su -c 执行命令
 * - Shizuku 模式：使用 shell 权限执行命令
 */
import { runCommand, detectRootMethod, isRootAvailable, isShizukuAvailable } from './nativeShell';
import type {
  AppInfo,
  ServiceInfo,
  NetworkStats,
  PartitionInfo,
  MountInfo,
  SensorInfo,
  PropInfo,
  RootStatus,
  OverviewData,
  HardwareData,
  SoftwareData,
  NetworkData,
  StorageData,
} from '@/types/device';

// ── 工具函数 ──────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

// ── Root 状态检测 ──────────────────────────────────────────────

/**
 * 检测 Root/Shizuku 状态
 * 返回 root 是否可用、shizuku 是否可用、root 方案名称
 */
export async function checkRootStatus(): Promise<RootStatus> {
  const [rootAvailable, shizukuAvailable] = await Promise.all([
    isRootAvailable().catch(() => false),
    isShizukuAvailable().catch(() => false),
  ]);

  let rootMethod = 'unknown';
  if (rootAvailable) {
    rootMethod = await detectRootMethod().catch(() => 'unknown');
  }

  return { rootAvailable, shizukuAvailable, rootMethod };
}

// ── 概览数据（Root 模式） ─────────────────────────────────────

/**
 * 获取 Root 模式下的概览数据（内核版本、SELinux、账户信息）
 */
export async function fetchRootOverviewData(): Promise<Partial<OverviewData>> {
  const [kernel, selinux, accounts] = await Promise.all([
    runCommand('uname -r', true)
      .then((r) => r.output)
      .catch(() => '未知'),
    runCommand('getenforce', true)
      .then((r) => r.output)
      .catch(() => '未知'),
    runCommand('pm list accounts', true)
      .then((r) => {
        const lines = r.output.split('\n').filter((l) => l.includes('{'));
        return {
          total: lines.length,
          google: lines.filter((l) => l.includes('com.google')).length,
        };
      })
      .catch(() => ({ total: 0, google: 0 })),
  ]);

  return {
    kernelVersion: kernel,
    selinuxStatus: selinux,
    accountCount: accounts.total,
    accountInfo: accounts,
  };
}

// ── 硬件数据（Root 模式） ─────────────────────────────────────

/**
 * 获取 Root 模式下的硬件数据（可用内存、CPU 核心数、传感器）
 */
export async function fetchRootHardwareData(): Promise<Partial<HardwareData>> {
  const [availMem, cpuInfo, sensors] = await Promise.all([
    runCommand('cat /proc/meminfo | grep MemAvailable', true)
      .then((r) => {
        const match = r.output.match(/MemAvailable:\s+(\d+)\s+kB/);
        return match ? formatBytes(parseInt(match[1]) * 1024) : '未知';
      })
      .catch(() => '未知'),
    runCommand('cat /proc/cpuinfo', true)
      .then((r) => {
        const processors = r.output.split('\n').filter((l) => l.startsWith('processor'));
        return { coreCount: processors.length };
      })
      .catch(() => ({ coreCount: 0 })),
    runCommand(
      'cat /sys/bus/platform/devices/soc:sensors/uevent 2>/dev/null || ls /sys/class/input/',
      true
    )
      .then((r) => {
        const lines = r.output.split('\n').filter((l) => l.length > 0);
        return lines.slice(0, 20).map((line, i) => ({
          name: `传感器 ${i + 1}`,
          type: line.split('=')[0]?.trim() || 'UNKNOWN',
          vendor: line.split('=')[1]?.trim() || '未知',
        }));
      })
      .catch(() => []),
  ]);

  return {
    availRam: availMem,
    coreCount: cpuInfo.coreCount,
    sensors,
  };
}

// ── 软件数据（Root 模式） ─────────────────────────────────────

/**
 * 获取 Root 模式下的软件数据（已安装应用、运行服务、系统属性）
 */
export async function fetchRootSoftwareData(): Promise<SoftwareData> {
  const [apps, services, props] = await Promise.all([
    runCommand('pm list packages -f', true)
      .then((r) => {
        const lines = r.output.split('\n').filter((l) => l.startsWith('package:'));
        return lines
          .map((line) => {
            const match = line.match(/package:(.+?)=(.+)/);
            if (!match) return null;
            const pkg = match[1];
            const name = match[2];
            const isSystem =
              pkg.startsWith('/system/') ||
              pkg.startsWith('/vendor/') ||
              pkg.startsWith('/product/');
            return {
              packageName: name,
              name: name.split('.').pop() || name,
              version: '',
              isSystem,
            };
          })
          .filter(Boolean) as AppInfo[];
      })
      .catch(() => []),
    runCommand('ps -A -o PID,NAME', true)
      .then((r) => {
        const lines = r.output.split('\n').slice(1); // skip header
        return lines.slice(0, 50).map((line) => {
          const parts = line.trim().split(/\s+/);
          return {
            name: parts[parts.length - 1] || 'unknown',
            pid: parts[0] || '?',
            status: '运行中',
          };
        });
      })
      .catch(() => []),
    runCommand('getprop', true)
      .then((r) => {
        const lines = r.output.split('\n').filter((l) => l.includes('[') && l.includes(']'));
        return lines
          .slice(0, 30)
          .map((line) => {
            const match = line.match(/\[(.+?)\]:\s*\[(.+?)\]/);
            if (!match) return null;
            return { key: match[1], value: match[2] };
          })
          .filter(Boolean) as PropInfo[];
      })
      .catch(() => []),
  ]);

  return { installedApps: apps, runningServices: services, buildProps: props };
}

// ── 网络数据（Root 模式） ─────────────────────────────────────

/**
 * 获取 Root 模式下的网络统计数据
 */
export async function fetchRootNetworkData(): Promise<NetworkStats> {
  const result = await runCommand('cat /proc/net/dev | tail -n +3', true).catch(() => ({
    output: '',
    error: '',
    exitCode: 1,
  }));

  const lines = result.output.split('\n').filter((l) => l.includes(':'));
  let totalRx = 0;
  let totalTx = 0;
  lines.forEach((line) => {
    const parts = line.split(':').pop()?.trim().split(/\s+/);
    if (parts && parts.length > 9) {
      totalRx += parseInt(parts[1]) || 0;
      totalTx += parseInt(parts[9]) || 0;
    }
  });

  return {
    rxBytes: formatBytes(totalRx),
    txBytes: formatBytes(totalTx),
    connections: 0,
  };
}

// ── 存储数据（Root 模式） ─────────────────────────────────────

/**
 * 获取 Root 模式下的存储数据（分区信息、挂载点）
 */
export async function fetchRootStorageData(): Promise<Partial<StorageData>> {
  const [partitions, mounts] = await Promise.all([
    runCommand('cat /proc/partitions', true)
      .then((r) => {
        const lines = r.output.split('\n').slice(2);
        return lines
          .slice(0, 20)
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 4) return null;
            const sizeKB = parseInt(parts[2]) || 0;
            return {
              name: parts[3] || 'unknown',
              size:
                sizeKB > 1048576
                  ? `${(sizeKB / 1048576).toFixed(1)} GB`
                  : `${(sizeKB / 1024).toFixed(0)} MB`,
              type: 'ext4',
            };
          })
          .filter(Boolean) as PartitionInfo[];
      })
      .catch(() => []),
    runCommand('cat /proc/mounts', true)
      .then((r) => {
        const lines = r.output.split('\n');
        return lines
          .slice(0, 30)
          .map((line) => {
            const parts = line.split(/\s+/);
            if (parts.length < 3) return null;
            return {
              device: parts[0],
              mountPoint: parts[1],
              fsType: parts[2],
            };
          })
          .filter(Boolean) as MountInfo[];
      })
      .catch(() => []),
  ]);

  return { partitions, mountPoints: mounts };
}
