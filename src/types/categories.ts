import type { RecordType } from './index'

/**
 * 收入分类
 */
export const INCOME_CATEGORIES = [
  { name: '工资', icon: 'wallet' },
  { name: '奖金', icon: 'gift' },
  { name: '投资', icon: 'chart' },
  { name: '兼职', icon: 'briefcase' },
  { name: '红包', icon: 'redpacket' },
  { name: '退款', icon: 'refresh' },
  { name: '其他', icon: 'more' }
] as const

/**
 * 支出分类
 */
export const EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: 'food' },
  { name: '交通', icon: 'transport' },
  { name: '购物', icon: 'shopping' },
  { name: '娱乐', icon: 'entertainment' },
  { name: '居住', icon: 'home' },
  { name: '医疗', icon: 'medical' },
  { name: '教育', icon: 'education' },
  { name: '通讯', icon: 'phone' },
  { name: '人情', icon: 'gift' },
  { name: '其他', icon: 'more' }
] as const

/**
 * 根据类型获取分类
 */
export function getCategories(type: RecordType) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

/**
 * 获取分类图标
 */
export function getCategoryIcon(category: string, type: RecordType): string {
  const categories = getCategories(type)
  const found = Array.isArray(categories) ? categories.find((c: any) => c.name === category) : undefined
  return found?.icon || 'more'
}






