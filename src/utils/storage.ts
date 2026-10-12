/**
 * 本地存储工具
 */
const STORAGE_KEYS = {
  RECORDS: 'records',
  BUDGETS: 'budgets',
  SETTINGS: 'settings'
}

/**
 * 获取数据
 */
export function getStorage<T>(key: string): T | null {
  try {
    const value = uni.getStorageSync(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('获取存储失败:', error)
    return null
  }
}

/**
 * 保存数据
 */
export function setStorage<T>(key: string, value: T): boolean {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('保存存储失败:', error)
    return false
  }
}

/**
 * 删除数据
 */
export function removeStorage(key: string): boolean {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (error) {
    console.error('删除存储失败:', error)
    return false
  }
}

/**
 * 清除所有数据
 */
export function clearStorage(): boolean {
  try {
    uni.clearStorageSync()
    return true
  } catch (error) {
    console.error('清除存储失败:', error)
    return false
  }
}

/**
 * 获取记录
 */
export function getRecords() {
  return getStorage<any[]>(STORAGE_KEYS.RECORDS) || []
}

/**
 * 保存记录
 */
export function setRecords(records: any[]) {
  return setStorage(STORAGE_KEYS.RECORDS, records)
}

/**
 * 获取预算
 */
export function getBudgets() {
  return getStorage<any[]>(STORAGE_KEYS.BUDGETS) || []
}

/**
 * 保存预算
 */
export function setBudgets(budgets: any[]) {
  return setStorage(STORAGE_KEYS.BUDGETS, budgets)
}

/**
 * 获取设置
 */
export function getSettings() {
  return getStorage(STORAGE_KEYS.SETTINGS)
}

/**
 * 保存设置
 */
export function setSettings(settings: any) {
  return setStorage(STORAGE_KEYS.SETTINGS, settings)
}

/**
 * 导出数据为 JSON
 */
export function exportDataToJson(data: any): string {
  return JSON.stringify(data, null, 2)
}

/**
 * 从 JSON 导入数据
 */
export function importDataFromJson(jsonString: string): any {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('解析 JSON 失败:', error)
    return null
  }
}

