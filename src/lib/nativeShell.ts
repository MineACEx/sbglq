/**
 * NativeShell — 原生 Shell 执行模块的 TypeScript 封装
 *
 * 通过 Expo Config Plugin (withShellPlugin) 在 prebuild 时注入的原生模块。
 * 提供 root/shizuku 命令执行、root 检测、shizuku 检测等功能。
 */
import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `NativeShell is not available. ` +
  `Make sure the withShellPlugin config plugin is configured in app.json ` +
  `and you have run 'npx expo prebuild' or 'npx expo run:android'.`;

const NativeShell = NativeModules.NativeShell
  ? NativeModules.NativeShell
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface ShellResult {
  output: string;
  error: string;
  exitCode: number;
}

/**
 * 执行 Shell 命令
 * @param command 要执行的命令
 * @param useRoot 是否使用 root 权限 (su -c)
 */
export async function runCommand(command: string, useRoot = false): Promise<ShellResult> {
  return NativeShell.runCommand(command, useRoot);
}

/**
 * 检测 Root 方案（Magisk / KernelSU / APatch / Superuser / unknown）
 */
export async function detectRootMethod(): Promise<string> {
  return NativeShell.detectRootMethod();
}

/**
 * 检测 Root 是否可用（通过 su -c 'id' 验证 uid=0）
 */
export async function isRootAvailable(): Promise<boolean> {
  return NativeShell.isRootAvailable();
}

/**
 * 检测 Shizuku 是否可用（通过检查 shizuku_server 进程）
 */
export async function isShizukuAvailable(): Promise<boolean> {
  return NativeShell.isShizukuAvailable();
}
