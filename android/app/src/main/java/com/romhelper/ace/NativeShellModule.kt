package com.romhelper.ace

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
                    arrayOf("sh", "-c", "cat /proc/$(pidof shizuku_server)/status 2>/dev/null || echo 'not_found'")
                )
                val shizukuOut = shizukuCheck.inputStream.bufferedReader().readText().trim()
                promise.resolve(shizukuOut != "not_found" && shizukuOut.isNotEmpty())
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }.start()
    }
}
