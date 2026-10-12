<template>
  <view class="container">
    <!-- 时间范围选择 -->
    <view class="time-selector">
      <view 
        class="time-tab" 
        :class="{ active: timeRange === 'month' }"
        @click="timeRange = 'month'"
      >
        <text>本月</text>
      </view>
      <view 
        class="time-tab" 
        :class="{ active: timeRange === 'year' }"
        @click="timeRange = 'year'"
      >
        <text>本年</text>
      </view>
      <view 
        class="time-tab" 
        :class="{ active: timeRange === 'compare' }"
        @click="timeRange = 'compare'"
      >
        <text>月度对比</text>
      </view>
      <view 
        class="time-tab" 
        :class="{ active: timeRange === 'trend' }"
        @click="timeRange = 'trend'"
      >
        <text>趋势图</text>
      </view>
    </view>

    <!-- 汇总卡片 -->
    <view class="summary-card">
      <view class="summary-row">
        <view class="summary-item">
          <text class="summary-label">{{ timeRangeLabel }}收入</text>
          <text class="summary-value income">¥{{ currentSummary.totalIncome.toFixed(2) }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">{{ timeRangeLabel }}支出</text>
          <text class="summary-value expense">¥{{ currentSummary.totalExpense.toFixed(2) }}</text>
        </view>
      </view>
      <view class="balance-row">
        <text class="balance-label">结余</text>
        <text class="balance-value">¥{{ currentSummary.balance.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 趋势图表 -->
    <view v-if="timeRange === 'trend'" class="trend-section">
      <text class="section-title">近30天消费趋势</text>
      
      <view class="trend-chart">
        <view class="chart-container">
          <view class="y-axis">
            <text class="y-label">¥{{ maxDailyAmount.toFixed(0) }}</text>
            <text class="y-label">¥{{ (maxDailyAmount * 0.5).toFixed(0) }}</text>
            <text class="y-label">¥0</text>
          </view>
          <view class="chart-area">
            <view 
              v-for="(item, index) in trendData" 
              :key="index"
              class="chart-bar"
            >
              <view 
                class="bar-fill"
                :style="{ height: getBarHeight(item.amount) + '%' }"
              ></view>
              <text class="bar-label">{{ item.day }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="trend-stats">
        <view class="trend-stat-item">
          <text class="trend-stat-label">日均支出</text>
          <text class="trend-stat-value">¥{{ avgDailyExpense.toFixed(2) }}</text>
        </view>
        <view class="trend-stat-item">
          <text class="trend-stat-label">最高单日</text>
          <text class="trend-stat-value">¥{{ maxDailyAmount.toFixed(2) }}</text>
        </view>
        <view class="trend-stat-item">
          <text class="trend-stat-label">消费天数</text>
          <text class="trend-stat-value">{{ activeDays }}天</text>
        </view>
      </view>
    </view>

    <!-- 月度对比 -->
    <view v-if="timeRange === 'compare'" class="compare-section">
      <text class="section-title">近6个月对比</text>
      <view class="month-list">
        <view 
          v-for="item in monthlyComparison" 
          :key="item.month"
          class="month-item"
        >
          <view class="month-header">
            <text class="month-name">{{ item.month }}</text>
            <text class="month-balance" :class="{ positive: item.balance >= 0 }">
              {{ item.balance >= 0 ? '+' : '' }}¥{{ item.balance.toFixed(2) }}
            </text>
          </view>
          <view class="month-details">
            <view class="detail-item">
              <text class="detail-label">收入</text>
              <text class="detail-value income">¥{{ item.income.toFixed(2) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">支出</text>
              <text class="detail-value expense">¥{{ item.expense.toFixed(2) }}</text>
            </view>
          </view>
          <view class="month-bar">
            <view 
              class="bar-income" 
              :style="{ width: getBarWidth(item.income, item.maxAmount) + '%' }"
            ></view>
            <view 
              class="bar-expense" 
              :style="{ width: getBarWidth(item.expense, item.maxAmount) + '%' }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 年度报表 -->
    <view v-if="timeRange === 'year'" class="year-report">
      <text class="section-title">{{ currentYear }}年度报表</text>
      
      <view class="year-stats">
        <view class="stat-card">
          <text class="stat-value">{{ yearStats.totalRecords }}</text>
          <text class="stat-label">总记录数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ yearStats.avgMonthlyExpense.toFixed(0) }}</text>
          <text class="stat-label">月均支出</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ yearStats.maxMonthExpense.toFixed(0) }}</text>
          <text class="stat-label">最高月支出</text>
        </view>
      </view>

      <view class="top-categories">
        <text class="subsection-title">年度支出 TOP5</text>
        <view 
          v-for="(item, index) in yearTopCategories" 
          :key="item.category"
          class="top-item"
        >
          <view class="top-rank">{{ index + 1 }}</view>
          <text class="top-category">{{ item.category }}</text>
          <text class="top-amount">¥{{ item.amount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 分类统计 -->
    <view v-if="timeRange === 'month'" class="stats-section">
      <text class="section-title">支出分类统计</text>
      
      <view v-if="categoryStats.length === 0" class="empty-state">
        <text class="empty-text">暂无数据</text>
      </view>

      <view v-else class="category-list">
        <view 
          v-for="item in categoryStats" 
          :key="item.category"
          class="category-stat-item"
        >
          <view class="category-info">
            <text class="category-name">{{ item.category }}</text>
            <text class="category-count">{{ item.count }} 笔</text>
          </view>
          <view class="category-amount-info">
            <text class="category-amount">¥{{ item.amount.toFixed(2) }}</text>
            <text class="category-percent">{{ item.percentage.toFixed(1) }}%</text>
          </view>
          <view class="progress-bar">
            <view 
              class="progress-fill" 
              :style="{ width: item.percentage + '%' }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 记录总数 -->
    <view v-if="timeRange === 'month'" class="record-count-card">
      <text class="count-label">本月记录数</text>
      <text class="count-value">{{ currentSummary.recordCount }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, computed, onMounted } from 'vue'
// @ts-ignore
import { useRecordsStore } from '@/stores/records'

const recordsStore = useRecordsStore()
const timeRange = ref('month')
const currentYear = new Date().getFullYear()

const timeRangeLabel = computed(() => {
  if (timeRange.value === 'month') return '本月'
  if (timeRange.value === 'year') return '本年'
  return ''
})

// 获取当前时间范围的记录
const currentRecords = computed(() => {
  const now = new Date()
  const records = recordsStore.records
  
  if (timeRange.value === 'month') {
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}-${month}`
    return records.filter((r: any) => r.date.startsWith(prefix))
  }
  
  if (timeRange.value === 'year') {
    const year = now.getFullYear()
    return records.filter((r: any) => r.date.startsWith(`${year}`))
  }
  
  return records
})

// 当前汇总
const currentSummary = computed(() => {
  const list = currentRecords.value
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

const categoryStats = computed(() => {
  const list = currentRecords.value.filter((r: any) => r.type === 'expense')
  const totalAmount = list.reduce((sum: number, r: any) => sum + r.amount, 0)

  if (totalAmount === 0) return []

  const grouped: any = {}
  list.forEach((r: any) => {
    if (!grouped[r.category]) {
      grouped[r.category] = { amount: 0, count: 0 }
    }
    grouped[r.category].amount += r.amount
    grouped[r.category].count += 1
  })

  return Object.entries(grouped).map(([category, data]: [string, any]) => ({
    category,
    amount: data.amount,
    percentage: (data.amount / totalAmount) * 100,
    count: data.count
  })).sort((a: any, b: any) => b.amount - a.amount)
})

// 月度对比数据
const monthlyComparison = computed(() => {
  const now = new Date()
  const months = []
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}-${month}`
    
    const monthRecords = recordsStore.records.filter((r: any) => r.date.startsWith(prefix))
    const income = monthRecords
      .filter((r: any) => r.type === 'income')
      .reduce((sum: number, r: any) => sum + r.amount, 0)
    const expense = monthRecords
      .filter((r: any) => r.type === 'expense')
      .reduce((sum: number, r: any) => sum + r.amount, 0)
    
    months.push({
      month: `${year}年${month}月`,
      income,
      expense,
      balance: income - expense,
      maxAmount: 0
    })
  }
  
  // 计算最大值用于柱状图
  const maxAmount = Math.max(...months.map(m => Math.max(m.income, m.expense)))
  months.forEach(m => m.maxAmount = maxAmount)
  
  return months
})

// 年度统计
const yearStats = computed(() => {
  const yearRecords = currentRecords.value
  const expenses = yearRecords.filter((r: any) => r.type === 'expense')
  
  // 按月分组
  const monthlyExpenses: any = {}
  expenses.forEach((r: any) => {
    const month = r.date.substring(0, 7)
    if (!monthlyExpenses[month]) {
      monthlyExpenses[month] = 0
    }
    monthlyExpenses[month] += r.amount
  })
  
  const monthlyAmounts = Object.values(monthlyExpenses) as number[]
  const avgMonthlyExpense = monthlyAmounts.length > 0 
    ? monthlyAmounts.reduce((a: number, b: number) => a + b, 0) / monthlyAmounts.length 
    : 0
  const maxMonthExpense = monthlyAmounts.length > 0 ? Math.max(...monthlyAmounts) : 0
  
  return {
    totalRecords: yearRecords.length,
    avgMonthlyExpense,
    maxMonthExpense
  }
})

// 年度 TOP5 分类
const yearTopCategories = computed(() => {
  const yearExpenses = currentRecords.value.filter((r: any) => r.type === 'expense')
  const grouped: any = {}
  
  yearExpenses.forEach((r: any) => {
    if (!grouped[r.category]) {
      grouped[r.category] = 0
    }
    grouped[r.category] += r.amount
  })
  
  return Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount: amount as number }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

const getBarWidth = (value: number, max: number) => {
  if (max === 0) return 0
  return (value / max) * 100
}

// 趋势图数据 - 近30天
const trendData = computed(() => {
  const now = new Date()
  const days = []
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const dayRecords = recordsStore.records.filter((r: any) => 
      r.date === dateStr && r.type === 'expense'
    )
    
    const amount = dayRecords.reduce((sum: number, r: any) => sum + r.amount, 0)
    
    days.push({
      date: dateStr,
      day: date.getDate(),
      amount
    })
  }
  
  return days
})

const maxDailyAmount = computed(() => {
  const max = Math.max(...trendData.value.map(d => d.amount))
  return max > 0 ? max : 100
})

const avgDailyExpense = computed(() => {
  const total = trendData.value.reduce((sum, d) => sum + d.amount, 0)
  return total / 30
})

const activeDays = computed(() => {
  return trendData.value.filter(d => d.amount > 0).length
})

const getBarHeight = (amount: number) => {
  if (maxDailyAmount.value === 0) return 0
  return (amount / maxDailyAmount.value) * 100
}

onMounted(() => {
  recordsStore.loadFromStorage()
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.time-selector {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  background: white;
  border-radius: 20rpx;
  padding: 12rpx;
  overflow-x: auto;
}

.time-tab {
  flex-shrink: 0;
  padding: 20rpx 24rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #6b7280;
  transition: all 0.3s;
  white-space: nowrap;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
  }
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.summary-row {
  display: flex;
  gap: 40rpx;
  margin-bottom: 32rpx;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12rpx;
}

.summary-value {
  font-size: 32rpx;
  font-weight: bold;
  color: white;

  &.income {
    color: #4ade80;
  }

  &.expense {
    color: #fb7185;
  }
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.balance-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.balance-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #fbbf24;
}

.compare-section, .year-report {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24rpx;
  display: block;
}

.subsection-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
  display: block;
}

.month-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.month-item {
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 16rpx;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.month-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.month-balance {
  font-size: 28rpx;
  font-weight: bold;
  color: #ef4444;

  &.positive {
    color: #10b981;
  }
}

.month-details {
  display: flex;
  gap: 32rpx;
  margin-bottom: 16rpx;
}

.detail-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.detail-label {
  font-size: 24rpx;
  color: #9ca3af;
}

.detail-value {
  font-size: 24rpx;
  font-weight: 600;

  &.income {
    color: #10b981;
  }

  &.expense {
    color: #ef4444;
  }
}

.month-bar {
  display: flex;
  gap: 8rpx;
  height: 8rpx;
}

.bar-income, .bar-expense {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.bar-income {
  background: #10b981;
}

.bar-expense {
  background: #ef4444;
}

.year-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 20rpx;
  background: #f9fafb;
  border-radius: 16rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 12rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
}

.top-categories {
  margin-top: 32rpx;
}

.top-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
}

.top-rank {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.top-category {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
}

.top-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #ef4444;
}

.stats-section {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.category-stat-item {
  display: flex;
  flex-direction: column;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.category-name {
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 500;
}

.category-count {
  font-size: 24rpx;
  color: #9ca3af;
}

.category-amount-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.category-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #ef4444;
}

.category-percent {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.progress-bar {
  height: 12rpx;
  background: #f3f4f6;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.record-count-card {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-label {
  font-size: 28rpx;
  color: #6b7280;
}

.count-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

// 趋势图样式
.trend-section {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.trend-chart {
  margin: 32rpx 0;
}

.chart-container {
  display: flex;
  gap: 16rpx;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 80rpx;
  padding-right: 12rpx;
}

.y-label {
  font-size: 20rpx;
  color: #9ca3af;
  text-align: right;
}

.chart-area {
  flex: 1;
  display: flex;
  gap: 8rpx;
  align-items: flex-end;
  height: 400rpx;
  border-left: 2rpx solid #e5e7eb;
  border-bottom: 2rpx solid #e5e7eb;
  padding: 0 8rpx 32rpx 8rpx;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx 4rpx 0 0;
  min-height: 4rpx;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 18rpx;
  color: #9ca3af;
  margin-top: 8rpx;
  transform: rotate(-45deg);
  transform-origin: center;
}

.trend-stats {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #e5e7eb;
}

.trend-stat-item {
  flex: 1;
  text-align: center;
}

.trend-stat-label {
  font-size: 24rpx;
  color: #9ca3af;
  display: block;
  margin-bottom: 8rpx;
}

.trend-stat-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}
</style>
