<template>
  <view class="container">
    <!-- 预算预警 -->
    <view v-if="warningBudgets.length > 0" class="warning-section">
      <text class="warning-title">⚠️ 预算预警</text>
      <view 
        v-for="warning in warningBudgets" 
        :key="warning.id"
        class="warning-item"
        :class="{ danger: warning.percent > 100 }"
      >
        <view class="warning-header">
          <text class="warning-category">{{ warning.category }}</text>
          <text class="warning-percent">{{ warning.percent.toFixed(0) }}%</text>
        </view>
        <text class="warning-message">
          {{ warning.percent > 100 ? '已超支' : '即将超支' }} 
          ¥{{ Math.abs(warning.remaining).toFixed(2) }}
        </text>
      </view>
    </view>

    <!-- 本月预算总览 -->
    <view class="budget-overview">
      <text class="overview-title">本月预算</text>
      <text class="overview-amount">¥{{ totalBudget.toFixed(2) }}</text>
      <view class="overview-stats">
        <view class="stat-item">
          <text class="stat-label">已使用</text>
          <text class="stat-value used">¥{{ totalSpent.toFixed(2) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">剩余</text>
          <text class="stat-value remaining">¥{{ totalRemaining.toFixed(2) }}</text>
        </view>
      </view>
      <view class="progress-bar">
        <view 
          class="progress-fill" 
          :style="{ width: Math.min(budgetProgress, 100) + '%' }"
        ></view>
      </view>
      <text class="progress-text">已使用 {{ budgetProgress.toFixed(1) }}%</text>
    </view>

    <!-- 预算列表 -->
    <view class="budget-section">
      <view class="section-header">
        <text class="section-title">分类预算</text>
        <button class="add-budget-btn" @click="openAddDialog">+ 添加</button>
      </view>

      <view v-if="budgets.length === 0" class="empty-state">
        <text class="empty-text">暂无预算</text>
        <text class="empty-hint">点击右上角添加预算</text>
      </view>

      <view v-else class="budget-list">
        <view 
          v-for="budget in budgets" 
          :key="budget.id"
          class="budget-item"
        >
          <view class="budget-header">
            <text class="budget-category">{{ budget.category }}</text>
            <view class="budget-actions">
              <text class="budget-amount">¥{{ (budget.budgetAmount || 0).toFixed(2) }}</text>
              <text class="delete-btn" @click="handleDeleteBudget(budget.id)">🗑️</text>
            </view>
          </view>
          <view class="budget-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :class="{ warning: getBudgetPercent(budget) > 80, danger: getBudgetPercent(budget) > 100 }"
                :style="{ width: Math.min(getBudgetPercent(budget), 100) + '%' }"
              ></view>
            </view>
          </view>
          <view class="budget-footer">
            <text class="spent-text">已用 ¥{{ (budget.spentAmount || 0).toFixed(2) }}</text>
            <text class="remaining-text">剩余 ¥{{ ((budget.budgetAmount || 0) - (budget.spentAmount || 0)).toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加预算弹窗 - 使用uni-popup -->
    <view v-if="showAddDialog" class="popup-mask" @click="closeAddDialog">
      <view class="popup-dialog" @click.stop>
        <text class="popup-title">添加预算</text>
        
        <view class="popup-form">
          <view class="popup-field">
            <text class="field-label">分类</text>
            <!-- #ifdef H5 -->
            <select 
              class="field-select"
              v-model="newBudget.category"
              @change="onSelectChange"
            >
              <option value="">请选择分类</option>
              <option 
                v-for="(cat, index) in categoryOptions" 
                :key="index"
                :value="cat"
              >{{ cat }}</option>
            </select>
            <!-- #endif -->
            <!-- #ifndef H5 -->
            <picker 
              mode="selector" 
              :range="categoryOptions"
              :value="selectedCategoryIndex"
              @change="onCategoryChange"
            >
              <view class="field-picker">
                <text>{{ newBudget.category || '请选择分类' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
            <!-- #endif -->
          </view>

          <view class="popup-field">
            <text class="field-label">预算金额</text>
            <input 
              class="field-input" 
              type="number"
              v-model="newBudget.amount"
              placeholder="请输入金额"
            />
          </view>
        </view>

        <view class="popup-buttons">
          <button class="popup-btn cancel-btn" @click="closeAddDialog">取消</button>
          <button class="popup-btn confirm-btn" @click="handleAddBudget">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, reactive, computed, onMounted } from 'vue'
// @ts-ignore
import { onShow } from '@dcloudio/uni-app'
// @ts-ignore
import { useBudgetStore } from '@/stores/budget'
// @ts-ignore
import { useRecordsStore } from '@/stores/records'
// @ts-ignore
import { EXPENSE_CATEGORIES } from '@/types/categories'

const budgetStore = useBudgetStore()
const recordsStore = useRecordsStore()

const showAddDialog = ref(false)
const selectedCategoryIndex = ref(0)
const newBudget = reactive({
  category: '',
  amount: ''
})

// 分类选项
const categoryOptions = EXPENSE_CATEGORIES.map((cat: any) => cat.name)

const budgets = computed(() => budgetStore.budgets)

const totalBudget = computed(() => {
  return budgets.value.reduce((sum: number, b: any) => sum + (b.budgetAmount || 0), 0)
})

const totalSpent = computed(() => {
  return budgets.value.reduce((sum: number, b: any) => sum + (b.spentAmount || 0), 0)
})

const totalRemaining = computed(() => {
  return totalBudget.value - totalSpent.value
})

const budgetProgress = computed(() => {
  if (totalBudget.value === 0) return 0
  return (totalSpent.value / totalBudget.value) * 100
})

const getBudgetPercent = (budget: any) => {
  const budgetAmount = budget.budgetAmount || 0
  const spentAmount = budget.spentAmount || 0
  if (budgetAmount === 0) return 0
  return (spentAmount / budgetAmount) * 100
}

// 预算预警 - 超过80%或已超支
const warningBudgets = computed(() => {
  return budgets.value
    .map((budget: any) => {
      const percent = getBudgetPercent(budget)
      const remaining = (budget.budgetAmount || 0) - (budget.spentAmount || 0)
      return {
        ...budget,
        percent,
        remaining
      }
    })
    .filter((b: any) => b.percent >= 80)
    .sort((a: any, b: any) => b.percent - a.percent)
})

const openAddDialog = () => {
  showAddDialog.value = true
  newBudget.category = ''
  newBudget.amount = ''
  selectedCategoryIndex.value = 0
}

const closeAddDialog = () => {
  showAddDialog.value = false
}

const onCategoryChange = (e: any) => {
  selectedCategoryIndex.value = e.detail.value
  newBudget.category = categoryOptions[e.detail.value]
}

const onSelectChange = (e: any) => {
  console.log('选择了分类:', e.target.value)
  newBudget.category = e.target.value
}

const handleAddBudget = () => {
  if (!newBudget.category || !newBudget.amount) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  budgetStore.addBudget({
    category: newBudget.category,
    budgetAmount: parseFloat(newBudget.amount),
    spentAmount: 0,
    period: 'month'
  })

  uni.showToast({
    title: '添加成功',
    icon: 'success'
  })

  closeAddDialog()
}

const handleDeleteBudget = (id: string) => {
  uni.showModal({
    title: '删除预算',
    content: '确定要删除这个预算吗？',
    success: (res) => {
      if (res.confirm) {
        budgetStore.deleteBudget(id)
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

onMounted(() => {
  budgetStore.loadFromStorage()
  recordsStore.loadFromStorage()
  updateBudgetData()
})

// 每次显示页面时更新预算数据
onShow(() => {
  recordsStore.loadFromStorage()
  updateBudgetData()
})

// 更新预算数据的函数
function updateBudgetData() {
  budgetStore.updateAllBudgetsFromRecords(recordsStore.records)
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.warning-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fca5a5 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid #fbbf24;
}

.warning-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #92400e;
  margin-bottom: 20rpx;
  display: block;
}

.warning-item {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #fbbf24;

  &:last-child {
    margin-bottom: 0;
  }

  &.danger {
    border-left-color: #ef4444;
  }
}

.warning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.warning-category {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.warning-percent {
  font-size: 32rpx;
  font-weight: bold;
  color: #ef4444;
}

.warning-message {
  font-size: 24rpx;
  color: #6b7280;
}

.budget-overview {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
}

.overview-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
  display: block;
}

.overview-amount {
  font-size: 56rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 32rpx;
  display: block;
}

.overview-stats {
  display: flex;
  gap: 40rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 600;
  
  &.used {
    color: #fbbf24;
  }
  
  &.remaining {
    color: #4ade80;
  }
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 6rpx;
  transition: width 0.3s;

  &.warning {
    background: #fbbf24;
  }

  &.danger {
    background: #ef4444;
  }
}

.progress-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.budget-section {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  flex: 1;
}

.add-budget-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  margin-left: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 32rpx;
  color: #9ca3af;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #d1d5db;
}

.budget-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.budget-item {
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 16rpx;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.budget-category {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.budget-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.budget-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
}

.delete-btn {
  font-size: 32rpx;
  padding: 8rpx;
}

.budget-progress {
  margin-bottom: 12rpx;
}

.budget-footer {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
}

.spent-text {
  color: #ef4444;
}

.remaining-text {
  color: #10b981;
}

// 弹窗样式
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-dialog {
  width: 600rpx;
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 32rpx;
  display: block;
  text-align: center;
}

.popup-form {
  margin-bottom: 32rpx;
}

.popup-field {
  margin-bottom: 24rpx;
}

.field-label {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
  display: block;
}

.field-picker {
  width: 100%;
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #1f2937;
}

.field-select {
  width: 100%;
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1f2937;
  border: 2rpx solid transparent;
  
  &:focus {
    border-color: #667eea;
    background: white;
    outline: none;
  }
}

.picker-arrow {
  font-size: 20rpx;
  color: #9ca3af;
}

.field-input {
  width: 100%;
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1f2937;
  border: 2rpx solid transparent;

  &:focus {
    border-color: #667eea;
    background: white;
  }
}

.popup-buttons {
  display: flex;
  gap: 20rpx;
}

.popup-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
