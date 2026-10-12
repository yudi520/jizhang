// @ts-ignore
import { defineStore } from 'pinia'
// @ts-ignore
import { ref, computed } from 'vue'
// @ts-ignore
import type { Budget, BudgetPeriod } from '@/types'
// @ts-ignore
import { generateId, getMonthFirstDay, getMonthLastDay, formatDate } from '@/utils'
// @ts-ignore
import { getBudgets, setBudgets } from '@/utils/storage'

// @ts-ignore
const refFn = ref
// @ts-ignore
const computedFn = computed

export const useBudgetStore = defineStore('budget', () => {
  // @ts-ignore
  const budgets = refFn<Budget[]>([])
  // @ts-ignore
  const currentPeriod = refFn<BudgetPeriod>('month')

  // 加载本地存储
  function loadFromStorage() {
    const stored = getBudgets()
    if (stored) {
      budgets.value = stored
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    setBudgets(budgets.value)
  }

  // 添加预算
  function addBudget(budget: Omit<Budget, 'id' | 'createdAt'>) {
    const newBudget: Budget = {
      ...budget,
      spentAmount: budget.spentAmount || 0,
      id: generateId(),
      createdAt: Date.now()
    }

    // 检查是否已存在相同分类和周期的预算
    const existingIndex = budgets.value.findIndex(
      (b: Budget) => b.category === budget.category && b.period === budget.period
    )

    if (existingIndex !== -1) {
      // 更新现有预算
      budgets.value[existingIndex] = newBudget
    } else {
      // 添加新预算
      budgets.value.push(newBudget)
    }

    saveToStorage()
    return newBudget
  }

  // 更新预算
  function updateBudget(id: string, updates: Partial<Budget>) {
    const index = budgets.value.findIndex((b: Budget) => b.id === id)
    if (index !== -1) {
      budgets.value[index] = { ...budgets.value[index], ...updates }
      saveToStorage()
      return true
    }
    return false
  }

  // 删除预算
  function deleteBudget(id: string) {
    const index = budgets.value.findIndex((b: Budget) => b.id === id)
    if (index !== -1) {
      budgets.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  // 获取指定周期的预算
  const currentBudgets = computed(() => {
    return budgets.value.filter((b: Budget) => b.period === currentPeriod.value)
  })

  // 更新预算消费金额（根据记录计算）
  function updateBudgetSpent(
    category: string,
    spentAmount: number,
    period: BudgetPeriod
  ) {
    const budget = budgets.value.find(
      (b: Budget) => b.category === category && b.period === period
    )
    if (budget) {
      budget.spentAmount = spentAmount
      saveToStorage()
      return true
    }
    return false
  }

  // 计算预算进度
  function getBudgetProgress(budget: Budget): {
    percentage: number
    remaining: number
    isOverBudget: boolean
  } {
    const percentage = budget.budgetAmount > 0
      ? Math.round((budget.spentAmount / budget.budgetAmount) * 100)
      : 0
    const remaining = budget.budgetAmount - budget.spentAmount
    const isOverBudget = budget.spentAmount > budget.budgetAmount

    return { percentage, remaining, isOverBudget }
  }

  // 获取预算进度列表
  const budgetProgress = computed(() => {
    return currentBudgets.value.map((budget: Budget) => ({
      ...budget,
      ...getBudgetProgress(budget)
    }))
  })

  // 检查是否有超支预算
  const overBudgetItems = computed(() => {
    return budgetProgress.value.filter((b: any) => b.isOverBudget)
  })

  // 获取预算总览
  const budgetSummary = computed(() => {
    const totalBudget = currentBudgets.value.reduce(
      (sum: number, b: Budget) => sum + b.budgetAmount,
      0
    )
    const totalSpent = currentBudgets.value.reduce(
      (sum: number, b: Budget) => sum + b.spentAmount,
      0
    )

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      budgetCount: currentBudgets.value.length,
      overBudgetCount: overBudgetItems.value.length
    }
  })

  // 获取超支警告
  const overBudgetWarnings = computed(() => {
    return overBudgetItems.value.map((b: any) => ({
      category: b.category,
      budgetAmount: b.budgetAmount,
      spentAmount: b.spentAmount,
      overAmount: b.spentAmount - b.budgetAmount,
      period: b.period
    }))
  })

  // 根据消费记录更新所有预算
  function updateAllBudgetsFromRecords(records: any[]) {
    const now = new Date()
    const monthStart = formatDate(getMonthFirstDay(now))
    const monthEnd = formatDate(getMonthLastDay(now))

    // 更新月度预算
    budgets.value.forEach((budget: Budget) => {
      if (budget.period === 'month') {
        const monthRecords = records.filter(
          (r: any) =>
            r.type === 'expense' &&
            r.category === budget.category &&
            r.date >= monthStart &&
            r.date <= monthEnd
        )
        const spent = monthRecords.reduce((sum: number, r: any) => sum + r.amount, 0)
        budget.spentAmount = spent
      }
    })

    saveToStorage()
  }

  // 更新已花费金额（从 records store 获取数据）
  function updateSpentAmounts() {
    // 这个方法需要在组件中调用，传入 records
    // 这里只是一个占位，实际更新在 updateAllBudgetsFromRecords 中
  }

  // 清空所有预算
  function clearBudgets() {
    budgets.value = []
    saveToStorage()
  }

  // 批量导入预算
  function importBudgets(data: Budget[]) {
    budgets.value = data
    saveToStorage()
  }

  // 获取分类预算
  function getBudgetByCategory(category: string, period: BudgetPeriod) {
    return budgets.value.find(
      (b: Budget) => b.category === category && b.period === period
    )
  }

  return {
    budgets,
    currentPeriod,
    currentBudgets,
    budgetProgress,
    budgetSummary,
    overBudgetItems,
    overBudgetWarnings,
    loadFromStorage,
    addBudget,
    updateBudget,
    deleteBudget,
    updateBudgetSpent,
    getBudgetProgress,
    updateAllBudgetsFromRecords,
    updateSpentAmounts,
    clearBudgets,
    importBudgets,
    getBudgetByCategory
  }
})

