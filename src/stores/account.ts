// @ts-ignore
import { defineStore } from 'pinia'
// @ts-ignore
import { ref } from 'vue'

export interface Account {
  id: string
  name: string
  balance: number
  icon: string
  color: string
  createdAt: number
}

// @ts-ignore
const refFn = ref

const STORAGE_KEY = 'accounts'
const CURRENT_ACCOUNT_KEY = 'currentAccount'

export const useAccountStore = defineStore('account', () => {
  // @ts-ignore
  const accounts = refFn<Account[]>([])
  // @ts-ignore
  const currentAccountId = refFn<string>('')

  // 加载本地存储
  function loadFromStorage() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      if (stored) {
        accounts.value = JSON.parse(stored)
      } else {
        // 初始化默认账户
        const defaultAccount: Account = {
          id: 'default',
          name: '默认账户',
          balance: 0,
          icon: '💰',
          color: '#667eea',
          createdAt: Date.now()
        }
        accounts.value = [defaultAccount]
        saveToStorage()
      }

      const currentId = uni.getStorageSync(CURRENT_ACCOUNT_KEY)
      if (currentId && accounts.value.find(a => a.id === currentId)) {
        currentAccountId.value = currentId
      } else {
        currentAccountId.value = accounts.value[0]?.id || ''
      }
    } catch (e) {
      console.error('加载账户失败:', e)
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(accounts.value))
      if (currentAccountId.value) {
        uni.setStorageSync(CURRENT_ACCOUNT_KEY, currentAccountId.value)
      }
    } catch (e) {
      console.error('保存账户失败:', e)
    }
  }

  // 添加账户
  function addAccount(account: Omit<Account, 'id' | 'createdAt'>) {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: Date.now()
    }
    accounts.value.push(newAccount)
    saveToStorage()
    return newAccount
  }

  // 更新账户
  function updateAccount(id: string, updates: Partial<Account>) {
    const index = accounts.value.findIndex(a => a.id === id)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updates }
      saveToStorage()
      return true
    }
    return false
  }

  // 删除账户
  function deleteAccount(id: string) {
    if (accounts.value.length <= 1) {
      return false // 至少保留一个账户
    }
    const index = accounts.value.findIndex(a => a.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      if (currentAccountId.value === id) {
        currentAccountId.value = accounts.value[0]?.id || ''
      }
      saveToStorage()
      return true
    }
    return false
  }

  // 切换当前账户
  function switchAccount(id: string) {
    if (accounts.value.find(a => a.id === id)) {
      currentAccountId.value = id
      saveToStorage()
      return true
    }
    return false
  }

  // 获取当前账户
  function getCurrentAccount() {
    return accounts.value.find(a => a.id === currentAccountId.value)
  }

  // 更新账户余额
  function updateBalance(id: string, amount: number) {
    const account = accounts.value.find(a => a.id === id)
    if (account) {
      account.balance += amount
      saveToStorage()
      return true
    }
    return false
  }

  // 清空所有账户
  function clearAccounts() {
    const defaultAccount: Account = {
      id: 'default',
      name: '默认账户',
      balance: 0,
      icon: '💰',
      color: '#667eea',
      createdAt: Date.now()
    }
    accounts.value = [defaultAccount]
    currentAccountId.value = 'default'
    saveToStorage()
  }

  return {
    accounts,
    currentAccountId,
    loadFromStorage,
    addAccount,
    updateAccount,
    deleteAccount,
    switchAccount,
    getCurrentAccount,
    updateBalance,
    clearAccounts
  }
})






