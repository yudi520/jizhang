// @ts-ignore
import { defineStore } from 'pinia'
// @ts-ignore
import { ref } from 'vue'

// @ts-ignore
const refFn = ref

const STORAGE_KEY = 'appLock'

export interface LockSettings {
  enabled: boolean
  password: string
  useBiometric: boolean
}

export const useLockStore = defineStore('lock', () => {
  // @ts-ignore
  const lockSettings = refFn<LockSettings>({
    enabled: false,
    password: '',
    useBiometric: false
  })
  // @ts-ignore
  const isLocked = refFn(false)

  // 加载设置
  function loadFromStorage() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      if (stored) {
        lockSettings.value = JSON.parse(stored)
        if (lockSettings.value.enabled) {
          isLocked.value = true
        }
      }
    } catch (e) {
      console.error('加载锁定设置失败:', e)
    }
  }

  // 保存设置
  function saveToStorage() {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(lockSettings.value))
    } catch (e) {
      console.error('保存锁定设置失败:', e)
    }
  }

  // 设置密码
  function setPassword(password: string) {
    lockSettings.value.password = password
    lockSettings.value.enabled = true
    saveToStorage()
  }

  // 验证密码
  function verifyPassword(password: string): boolean {
    return lockSettings.value.password === password
  }

  // 解锁
  function unlock() {
    isLocked.value = false
  }

  // 锁定
  function lock() {
    if (lockSettings.value.enabled) {
      isLocked.value = true
    }
  }

  // 禁用密码锁
  function disableLock() {
    lockSettings.value.enabled = false
    lockSettings.value.password = ''
    isLocked.value = false
    saveToStorage()
  }

  // 修改密码
  function changePassword(oldPassword: string, newPassword: string): boolean {
    if (verifyPassword(oldPassword)) {
      lockSettings.value.password = newPassword
      saveToStorage()
      return true
    }
    return false
  }

  return {
    lockSettings,
    isLocked,
    loadFromStorage,
    setPassword,
    verifyPassword,
    unlock,
    lock,
    disableLock,
    changePassword
  }
})






