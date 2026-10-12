/**
 * 记录类型
 */
export type RecordType = 'income' | 'expense'

/**
 * 收支记录
 */
export interface RecordItem {
  id: string
  type: RecordType
  amount: number
  category: string
  date: string
  remark?: string
  createdAt?: number
}

/**
 * 预算周期
 */
export type BudgetPeriod = 'month' | 'year'

/**
 * 预算
 */
export interface Budget {
  id: string
  category: string
  budgetAmount: number
  spentAmount: number
  period: BudgetPeriod
  createdAt?: number
}

/**
 * 筛选条件
 */
export interface RecordFilter {
  type?: RecordType
  startDate?: string
  endDate?: string
  category?: string
  keyword?: string
}

/**
 * 统计汇总
 */
export interface Summary {
  totalIncome: number
  totalExpense: number
  balance: number
  recordCount: number
}

/**
 * 分类统计
 */
export interface CategoryStats {
  category: string
  amount: number
  percentage: number
  count: number
}

/**
 * 时间范围类型
 */
export type DateRangeType = 'week' | 'month' | 'year' | 'custom'

/**
 * 自定义时间范围
 */
export interface CustomDateRange {
  startDate: string
  endDate: string
}

/**
 * 图表数据点
 */
export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

/**
 * 应用主题
 */
export type Theme = 'light' | 'dark'

/**
 * 应用设置
 */
export interface AppSettings {
  theme: Theme
  currency: string
  firstDayOfWeek: number // 0 = Sunday, 1 = Monday
}

/**
 * 导出数据
 */
export interface ExportData {
  records: RecordItem[]
  budgets: Budget[]
  settings: AppSettings
  exportDate: string
}

