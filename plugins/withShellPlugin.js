/**
 * Expo Config Plugin: withShellPlugin
 *
 * 在 prebuild 时自动向 Android 项目注入原生 Shell 模块代码：
 * - NativeShellModule.kt  (原生 Shell 执行)
 * - NativeShellPackage.kt (ReactPackage 注册)
 * - 修改 MainApplication.kt 添加 Package
 * - 添加必要的 Android 权限
 */

const {
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins');

const fs = require('fs');
const path = require('path');

// ── Kotlin 源码 ──────────────────────────────────────────────

const NATIVE_SHELL_MODULE_KT = `package com.romhelper.ace

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments

class NativeShellModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NativeShell"

    @ReactMethod
    fun runCommand(command: String, useRoot: Boolean, promise: Promise) {
        Thread {
            try {
                val cmd = if (useRoot) "su -c '$command'" else command
                val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", cmd))
                val output = process.inputStream.bufferedReader().readText().trim()
                val error = process.errorStream.bufferedReader().readText().trim()
                val exitCode = process.waitFor()

                val result = Arguments.createMap()
                result.putString("output", output)
                result.putString("error", error)
                result.putInt("exitCode", exitCode)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("SHELL_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun detectRootMethod(promise: Promise) {
        Thread {
            try {
                var method = "unknown"
                val magisk = Runtime.getRuntime().exec(arrayOf("sh", "-c", "su -c 'magisk -v'"))
                val magiskOut = magisk.inputStream.bufferedReader().readText().trim()
                if (magisk.waitFor() == 0 && magiskOut.isNotEmpty()) {
                    method = "Magisk"
                } else {
                    val ksu = Runtime.getRuntime().exec(arrayOf("sh", "-c", "su -c 'ksud --version'"))
                    val ksuOut = ksu.inputStream.bufferedReader().readText().trim()
                    if (ksu.waitFor() == 0 && ksuOut.isNotEmpty()) {
                        method = "KernelSU"
                    } else {
                        val apatch = Runtime.getRuntime().exec(arrayOf("sh", "-c", "su -c 'apd --version'"))
                        val apatchOut = apatch.inputStream.bufferedReader().readText().trim()
                        if (apatch.waitFor() == 0 && apatchOut.isNotEmpty()) {
                            method = "APatch"
                        } else {
                            val su = Runtime.getRuntime().exec(arrayOf("sh", "-c", "which su"))
                            if (su.waitFor() == 0) {
                                method = "Superuser"
                            }
                        }
                    }
                }
                promise.resolve(method)
            } catch (e: Exception) {
                promise.reject("ROOT_DETECT_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun isRootAvailable(promise: Promise) {
        Thread {
            try {
                val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", "su -c 'id'"))
                val output = process.inputStream.bufferedReader().readText().trim()
                val exitCode = process.waitFor()
                promise.resolve(exitCode == 0 && output.contains("uid=0"))
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }.start()
    }

    @ReactMethod
    fun isShizukuAvailable(promise: Promise) {
        Thread {
            try {
                val shizukuCheck = Runtime.getRuntime().exec(
                    arrayOf("sh", "-c", "cat /proc/\$(pidof shizuku_server)/status 2>/dev/null || echo 'not_found'")
                )
                val shizukuOut = shizukuCheck.inputStream.bufferedReader().readText().trim()
                promise.resolve(shizukuOut != "not_found" && shizukuOut.isNotEmpty())
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }.start()
    }
}
`;

const NATIVE_SHELL_PACKAGE_KT = `package com.romhelper.ace

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class NativeShellPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return mutableListOf<NativeModule>().apply {
            add(NativeShellModule(reactContext))
        }
    }
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
`;

// ── 辅助函数 ──────────────────────────────────────────────────

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFileSafe(filePath, content) {
  ensureDir(path.dirname(filePath));
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing === content) return;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

function getJavaDir(projectRoot) {
  return path.join(
    projectRoot, 'android', 'app', 'src', 'main', 'java', 'com', 'romhelper', 'ace'
  );
}

// ── 1. 注入 Kotlin 源文件 ────────────────────────────────────

function withKotlinSources(config) {
  return withDangerousMod(config, ['android', (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const javaDir = getJavaDir(projectRoot);
    ensureDir(javaDir);

    writeFileSafe(path.join(javaDir, 'NativeShellModule.kt'), NATIVE_SHELL_MODULE_KT);
    writeFileSafe(path.join(javaDir, 'NativeShellPackage.kt'), NATIVE_SHELL_PACKAGE_KT);
    // Remove old NativeShellSpec.kt if exists (no longer needed)
    const specPath = path.join(javaDir, 'NativeShellSpec.kt');
    if (fs.existsSync(specPath)) {
      fs.unlinkSync(specPath);
    }

    return config;
  }]);
}

// ── 2. 修改 MainApplication.kt 添加 Package ────────────────────

function withMainApplicationMod(config) {
  return withDangerousMod(config, ['android', (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const javaDir = getJavaDir(projectRoot);
    const filePath = path.join(javaDir, 'MainApplication.kt');

    if (!fs.existsSync(filePath)) {
      return config;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Add import if not present
    if (!content.includes('import com.romhelper.ace.NativeShellPackage')) {
      content = content.replace(
        /package com\.romhelper\.ace\n/,
        'package com.romhelper.ace\n\nimport com.romhelper.ace.NativeShellPackage\n'
      );
    }

    // Add NativeShellPackage() to the packages list
    if (!content.includes('NativeShellPackage()')) {
      if (content.includes('packages.apply')) {
        content = content.replace(
          /packages\.apply\s*\{/,
          "packages.apply {\n                    // NativeShell: Shell execution module\n                    add(NativeShellPackage())"
        );
      } else if (content.includes('PackageList(this).packages')) {
        content = content.replace(
          /PackageList\(this\)\.packages/,
          "PackageList(this).packages.apply {\n                    add(NativeShellPackage())\n                }"
        );
      }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return config;
  }]);
}

// ── 3. 添加 Android 权限 ────────────────────────────────────

function withPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest['uses-permission'] || [];

    const needed = [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ];

    for (const name of needed) {
      const exists = permissions.some((p) => p['$']?.['android:name'] === name);
      if (!exists) {
        permissions.push({ '$': { 'android:name': name } });
      }
    }

    manifest['uses-permission'] = permissions;
    return config;
  });
}

// ── 主插件导出 ────────────────────────────────────────────────

module.exports = function withShellPlugin(config) {
  config = withPermissions(config);
  config = withKotlinSources(config);
  config = withMainApplicationMod(config);
  return config;
};
