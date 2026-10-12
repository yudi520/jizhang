<template>
  <view class="container">
    <!-- 搜索和筛选栏 -->
    <view class="search-filter-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="searchKeyword"
          placeholder="搜索分类或备注"
          @input="handleSearch"
        />
      </view>
      <view class="filter-btn" @click="showFilterDialog = true">
        <text class="filter-icon">🎯</text>
      </view>
    </view>

    <!-- 汇总卡片 -->
    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-label">本月收入</text>
        <text class="summary-value income">¥{{ summary.totalIncome.toFixed(2) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">本月支出</text>
        <text class="summary-value expense">¥{{ summary.totalExpense.toFixed(2) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">结余</text>
        <text class="summary-value balance">¥{{ summary.balance.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 快速记账按钮 -->
    <view class="quick-add">
      <button class="add-btn" @click="goToAdd">
        <text class="add-icon">+</text>
        <text class="add-text">记一笔</text>
      </button>
    </view>

    <!-- 最近记录 -->
    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">{{ filterActive ? '筛选结果' : '最近记录' }}</text>
        <text class="record-count">共 {{ displayRecords.length }} 条</text>
      </view>
      
      <view v-if="displayRecords.length === 0" class="empty-state">
        <text class="empty-text">{{ filterActive ? '没有符合条件的记录' : '暂无记录' }}</text>
        <text class="empty-hint">{{ filterActive ? '尝试调整筛选条件' : '点击上方按钮开始记账' }}</text>
      </view>

      <view v-else class="record-list">
        <view
          v-for="record in displayRecords"
          :key="record.id"
          class="record-item"
        >
          <view class="record-left">
            <text class="record-category">{{ record.category }}</text>
            <text class="record-date">{{ formatDateTime(record.createdAt || Date.now()) }}</text>
            <text v-if="record.remark" class="record-remark">{{ record.remark }}</text>
          </view>
          <view class="record-right" @click.stop="showRecordMenu(record)">
            <text
              class="record-amount"
              :class="record.type"
            >
              {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount.toFixed(2) }}
            </text>
            <text class="more-icon">⋯</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选对话框 -->
    <view v-if="showFilterDialog" class="dialog-mask" @click="showFilterDialog = false">
      <view class="dialog-content" @click.stop>
        <text class="dialog-title">筛选条件</text>
        
        <view class="filter-section">
          <text class="filter-label">类型</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filterType === '' }"
              @click="filterType = ''"
            >
              <text>全部</text>
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filterType === 'expense' }"
              @click="filterType = 'expense'"
            >
              <text>支出</text>
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filterType === 'income' }"
              @click="filterType = 'income'"
            >
              <text>收入</text>
            </view>
          </view>
        </view>

        <view class="filter-section">
          <text class="filter-label">日期范围</text>
          <view class="date-range">
            <picker 
              mode="date" 
              :value="filterStartDate"
              @change="onStartDateChange"
            >
              <view class="date-picker">
                {{ filterStartDate || '开始日期' }}
              </view>
            </picker>
            <text class="date-separator">至</text>
            <picker 
              mode="date" 
              :value="filterEndDate"
              @change="onEndDateChange"
            >
              <view class="date-picker">
                {{ filterEndDate || '结束日期' }}
              </view>
            </picker>
          </view>
        </view>

        <view class="dialog-buttons">
          <button class="dialog-btn cancel" @click="handleResetFilter">重置</button>
          <button class="dialog-btn confirm" @click="handleApplyFilter">应用</button>
        </view>
      </view>
    </view>

    <!-- 记录操作菜单 -->
    <view v-if="showRecordMenuDialog" class="dialog-mask" @click="showRecordMenuDialog = false">
      <view class="dialog-content menu-dialog" @click.stop>
        <text class="dialog-title">记录操作</text>
        <view class="menu-options">
          <view class="menu-option" @click="handleEditRecord">
            <text class="menu-icon">✏️</text>
            <text class="menu-text">编辑</text>
          </view>
          <view class="menu-option" @click="handleCopyRecord">
            <text class="menu-icon">📋</text>
            <text class="menu-text">复制</text>
          </view>
          <view class="menu-option danger" @click="handleDeleteRecord">
            <text class="menu-icon">🗑️</text>
            <text class="menu-text">删除</text>
          </view>
        </view>
        <view class="dialog-buttons">
          <button class="dialog-btn cancel" @click="showRecordMenuDialog = false">取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, computed, onMounted } from 'vue'
// @ts-ignore
import { onShow } from '@dcloudio/uni-app'
// @ts-ignore
import { useRecordsStore } from '@/stores/records'
// @ts-ignore
import { formatDateTime } from '@/utils'

const recordsStore = useRecordsStore()

const searchKeyword = ref('')
const showFilterDialog = ref(false)
const filterType = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')
const filterActive = ref(false)

const records = computed(() => recordsStore.records)
const summary = computed(() => recordsStore.summary)

// 显示的记录（应用搜索和筛选）
const displayRecords = computed(() => {
  let result = [...records.value].sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
  
  // 应用搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((r: any) =>
      r.category.toLowerCase().includes(keyword) ||
      (r.remark && r.remark.toLowerCase().includes(keyword))
    )
  }
  
  // 应用类型筛选
  if (filterType.value) {
    result = result.filter((r: any) => r.type === filterType.value)
  }
  
  // 应用日期筛选
  if (filterStartDate.value) {
    result = result.filter((r: any) => r.date >= filterStartDate.value)
  }
  if (filterEndDate.value) {
    result = result.filter((r: any) => r.date <= filterEndDate.value)
  }
  
  // 限制显示数量（如果没有筛选，只显示最近20条）
  if (!filterActive.value && !searchKeyword.value) {
    return result.slice(0, 20)
  }
  
  return result
})

const handleSearch = () => {
  // 搜索时自动触发
}

const onStartDateChange = (e: any) => {
  filterStartDate.value = e.detail.value
}

const onEndDateChange = (e: any) => {
  filterEndDate.value = e.detail.value
}

const handleApplyFilter = () => {
  filterActive.value = !!(filterType.value || filterStartDate.value || filterEndDate.value)
  showFilterDialog.value = false
}

const handleResetFilter = () => {
  filterType.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  filterActive.value = false
  showFilterDialog.value = false
}

onMounted(() => {
  try {
    recordsStore.loadFromStorage()
    console.log('数据加载完成，记录数:', recordsStore.records.length)
  } catch (e) {
    console.error('加载数据失败:', e)
  }
})

// 每次显示页面时刷新数据
onShow(() => {
  recordsStore.loadFromStorage()
})

const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/add/add'
  })
}

// 记录操作相关
const selectedRecord = ref<any>(null)
const showRecordMenuDialog = ref(false)

const showRecordMenu = (record: any) => {
  selectedRecord.value = record
  showRecordMenuDialog.value = true
}

const handleEditRecord = () => {
  if (!selectedRecord.value) return
  showRecordMenuDialog.value = false
  uni.navigateTo({
    url: `/pages/add/add?id=${selectedRecord.value.id}`
  })
}

const handleCopyRecord = () => {
  if (!selectedRecord.value) return
  showRecordMenuDialog.value = false
  
  // 复制记录，但使用当前日期
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  
  recordsStore.addRecord({
    type: selectedRecord.value.type,
    amount: selectedRecord.value.amount,
    category: selectedRecord.value.category,
    date: dateStr,
    createdAt: now.getTime(),
    remark: selectedRecord.value.remark
  })
  
  uni.showToast({
    title: '已复制',
    icon: 'success'
  })
}

const handleDeleteRecord = () => {
  if (!selectedRecord.value) return
  showRecordMenuDialog.value = false

  uni.showModal({
    title: '删除记录',
    content: `确定要删除这条${selectedRecord.value.type === 'income' ? '收入' : '支出'}记录吗？`,
    success: (res) => {
      if (res.confirm) {
        recordsStore.deleteRecord(selectedRecord.value.id)
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.search-filter-bar {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
}

.filter-btn {
  width: 100rpx;
  height: 100rpx;
  background: white;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.filter-icon {
  font-size: 40rpx;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.summary-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.summary-value {
  font-size: 36rpx;
  font-weight: bold;
  color: white;

  &.income {
    color: #4ade80;
  }

  &.expense {
    color: #fb7185;
  }

  &.balance {
    color: #fbbf24;
  }
}

.quick-add {
  margin-bottom: 30rpx;
}

.add-btn {
  width: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
}

.add-icon {
  font-size: 48rpx;
  color: white;
  font-weight: bold;
  margin-right: 16rpx;
  line-height: 1;
}

.add-text {
  font-size: 32rpx;
  color: white;
  font-weight: 600;
}

.recent-section {
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
}

.record-count {
  font-size: 24rpx;
  color: #9ca3af;
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

.record-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
}

.record-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.record-category {
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.record-date {
  font-size: 24rpx;
  color: #9ca3af;
  margin-bottom: 4rpx;
}

.record-remark {
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

.record-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  cursor: pointer;
}

.record-amount {
  font-size: 32rpx;
  font-weight: bold;

  &.income {
    color: #10b981;
  }

  &.expense {
    color: #ef4444;
  }
}

.more-icon {
  font-size: 40rpx;
  color: #9ca3af;
  padding: 8rpx;
  min-width: 48rpx;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  width: 600rpx;
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 32rpx;
  display: block;
  text-align: center;
}

.filter-section {
  margin-bottom: 32rpx;
}

.filter-label {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 16rpx;
  display: block;
}

.filter-options {
  display: flex;
  gap: 16rpx;
}

.filter-option {
  flex: 1;
  padding: 20rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  text-align: center;
  font-size: 26rpx;
  color: #6b7280;
  border: 2rpx solid transparent;

  &.active {
    background: #ede9fe;
    border-color: #667eea;
    color: #667eea;
    font-weight: 600;
  }
}

.date-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.date-picker {
  flex: 1;
  padding: 20rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #1f2937;
  text-align: center;
}

.date-separator {
  font-size: 24rpx;
  color: #9ca3af;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.dialog-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;

  &.cancel {
    background: #f3f4f6;
    color: #6b7280;
  }

  &.confirm {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
}

.menu-dialog {
  width: 500rpx;
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.menu-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  gap: 20rpx;
  transition: all 0.2s;

  &:active {
    background: #e5e7eb;
  }

  &.danger {
    background: #fef2f2;

    &:active {
      background: #fee2e2;
    }

    .menu-text {
      color: #ef4444;
    }
  }
}

.menu-icon {
  font-size: 40rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 500;
}
</style>

