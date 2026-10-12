// @ts-ignore
import { defineStore } from 'pinia'
// @ts-ignore
import { ref } from 'vue'
// @ts-ignore
import type { AppSettings, Theme } from '@/types'
// @ts-ignore
import { getSettings, setSettings } from '@/utils/storage'

// @ts-ignore
const refFn = ref

export const useSettingsStore = defineStore('settings', () => {
  // @ts-ignore
  const settings = refFn<AppSettings>({
    theme: 'light',
    currency: '¥',
    firstDayOfWeek: 1
  })

  // 加载本地存储
  function loadFromStorage() {
    const stored = getSettings()
    if (stored) {
      // @ts-ignore
      settings.value = { ...settings.value, ...stored }
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    setSettings(settings.value)
  }

  // 设置主题
  function setTheme(theme: Theme) {
    settings.value.theme = theme
    saveToStorage()
    applyTheme()
  }

  // 设置货币符号
  function setCurrency(symbol: string) {
    settings.value.currency = symbol
    saveToStorage()
  }

  // 设置每周第一天
  function setFirstDayOfWeek(day: number) {
    settings.value.firstDayOfWeek = day
    saveToStorage()
  }

  // 应用主题
  function applyTheme() {
    // 待实现：实现深色主题切换
    // 可以通过在页面根元素添加 class 或使用 CSS 变量
  }

  // 重置设置
  function resetSettings() {
    settings.value = {
      theme: 'light',
      currency: '¥',
      firstDayOfWeek: 1
    }
    saveToStorage()
    applyTheme()
  }

  return {
    settings,
    loadFromStorage,
    setTheme,
    setCurrency,
    setFirstDayOfWeek,
    applyTheme,
    resetSettings
  }
})






