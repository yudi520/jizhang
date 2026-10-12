// @ts-ignore
import { defineStore } from 'pinia'
// @ts-ignore
import { ref, computed } from 'vue'
// @ts-ignore
import type { RecordItem, RecordFilter, Summary, CategoryStats } from '@/types'
// @ts-ignore
import { generateId, groupBy, sortBy } from '@/utils'
// @ts-ignore
import { getRecords, setRecords } from '@/utils/storage'

// @ts-ignore
const refFn = ref
// @ts-ignore
const computedFn = computed

export const useRecordsStore = defineStore('records', () => {
  const records = refFn<RecordItem[]>([])
  const filter = refFn<RecordFilter>({})

  function loadFromStorage() {
    const stored = getRecords()
    if (stored) {
      records.value = stored
    }
  }

  function saveToStorage() {
    setRecords(records.value)
  }

  function addRecord(record: Omit<RecordItem, 'id' | 'createdAt'> & { createdAt?: number }) {
    const newRecord: RecordItem = {
      ...record,
      id: generateId(),
      createdAt: record.createdAt ?? Date.now()
    }
    records.value.unshift(newRecord)
    saveToStorage()
    return newRecord
  }

  function updateRecord(id: string, updates: Partial<RecordItem>) {
    const index = records.value.findIndex((r: any) => r.id === id)
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...updates }
      records.value = sortBy(records.value, 'createdAt', 'desc')
      saveToStorage()
      return true
    }
    return false
  }

  function deleteRecord(id: string) {
    const index = records.value.findIndex((r: any) => r.id === id)
    if (index !== -1) {
      records.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  const filteredRecords = computed(() => {
    let result = [...records.value]

    if (filter.value.type) {
      result = result.filter((r: any) => r.type === filter.value.type)
    }

    if (filter.value.startDate) {
      result = result.filter((r: any) => r.date >= filter.value.startDate!)
    }
    if (filter.value.endDate) {
      result = result.filter((r: any) => r.date <= filter.value.endDate!)
    }

    if (filter.value.category) {
      result = result.filter((r: any) => r.category === filter.value.category)
    }

    if (filter.value.keyword) {
      const keyword = filter.value.keyword.toLowerCase()
      result = result.filter((r: any) =>
        r.category.toLowerCase().includes(keyword) ||
        (r.remark && r.remark.toLowerCase().includes(keyword))
      )
    }

    return [...result].sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
  })

  const summary = computed((): Summary => {
    const list = filteredRecords.value
    const totalIncome = list
      .filter((r: any) => r.type === 'income')
      .reduce((sum: number, r: any) => sum + r.amount, 0)
    const totalExpense = list
      .filter((r: any) => r.type === 'expense')
      .reduce((sum: number, r: any) => sum + r.amount, 0)

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      recordCount: list.length
    }
  })

  const categoryStats = computed((): CategoryStats[] => {
    const list = filteredRecords.value.filter((r: any) => r.type === 'expense')
    const totalAmount = list.reduce((sum: number, r: any) => sum + r.amount, 0)

    if (totalAmount === 0) return []

    const grouped = groupBy(list, 'category')

    return Object.entries(grouped).map(([category, items]) => {
      const itemsArray = items as RecordItem[]
      const amount = itemsArray.reduce((sum: number, r: RecordItem) => sum + r.amount, 0)
      return {
        category,
        amount,
        percentage: (amount / totalAmount) * 100,
        count: itemsArray.length
      }
    }).sort((a: any, b: any) => b.amount - a.amount)
  })

  function getDailyStats(startDate: string, endDate: string) {
    const list = records.value.filter(
      (r: any) => r.date >= startDate && r.date <= endDate
    )

    const grouped = groupBy(list, 'date')
    const sortedDates = Object.keys(grouped).sort()

    return sortedDates.map(date => {
      const items = grouped[date] as RecordItem[]
      const income = items
        .filter((r: any) => r.type === 'income')
        .reduce((sum: number, r: RecordItem) => sum + r.amount, 0)
      const expense = items
        .filter((r: any) => r.type === 'expense')
        .reduce((sum: number, r: RecordItem) => sum + r.amount, 0)

      return { date, income, expense }
    })
  }

  function getMonthlyStats(year: number) {
    const list = records.value.filter((r: any) => r.date.startsWith(`${year}`))

    const grouped = groupBy(list, 'date')
    const monthlyData: { [key: string]: { income: number; expense: number } } = {}

    for (let month = 1; month <= 12; month++) {
      const key = `${year}-${String(month).padStart(2, '0')}`
      monthlyData[key] = { income: 0, expense: 0 }
    }

    for (const date in grouped) {
      const items = grouped[date] as RecordItem[]
      const monthKey = date.substring(0, 7)

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 }
      }

      items.forEach((r: any) => {
        if (r.type === 'income') {
          monthlyData[monthKey].income += r.amount
        } else {
          monthlyData[monthKey].expense += r.amount
        }
      })
    }

    return Object.entries(monthlyData)
      .sort()
      .map(([date, data]) => ({ date, ...data }))
  }

  function clearRecords() {
    records.value = []
    saveToStorage()
  }

  function importRecords(data: RecordItem[]) {
    records.value = data
    saveToStorage()
  }

  return {
    records,
    filter,
    filteredRecords,
    summary,
    categoryStats,
    loadFromStorage,
    addRecord,
    updateRecord,
    deleteRecord,
    getDailyStats,
    getMonthlyStats,
    clearRecords,
    importRecords
  }
})
