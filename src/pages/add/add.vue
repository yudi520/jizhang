<template>
  <view class="container" @click="hideCustomKeyboard">
    <view class="page-header">
      <text class="page-title">{{ isEditMode ? '编辑记录' : '记一笔' }}</text>
    </view>

    <view v-if="templates.length > 0 && !isEditMode" class="template-section">
      <text class="template-title">快速模板</text>
      <scroll-view class="template-scroll" scroll-x>
        <view class="template-list">
          <view
            v-for="tpl in templates"
            :key="tpl.id"
            class="template-item"
            @click.stop="useTemplate(tpl)"
            @longpress="deleteTemplate(tpl.id)"
          >
            <text class="template-name">{{ tpl.name }}</text>
            <text class="template-amount">¥{{ tpl.amount }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="type-tabs">
      <view class="tab-item" :class="{ active: formData.type === 'expense' }" @click.stop="switchType('expense')">
        <text class="tab-text">支出</text>
      </view>
      <view class="tab-item" :class="{ active: formData.type === 'income' }" @click.stop="switchType('income')">
        <text class="tab-text">收入</text>
      </view>
    </view>

    <view class="amount-section">
      <text class="currency">¥</text>
      <view class="amount-display" @click.stop="showAmountKeyboard">
        <text class="amount-value">{{ formData.amount || '0.00' }}</text>
      </view>
    </view>

    <view class="form-item">
      <text class="form-label">日期</text>
      <picker mode="date" :value="formData.date" @change="onDateChange">
        <view class="picker-value">{{ formData.date }}</view>
      </picker>
    </view>

    <view class="form-item">
      <text class="form-label">时间</text>
      <picker mode="time" :value="formData.time" @change="onTimeChange">
        <view class="picker-value">{{ formData.time }}</view>
      </picker>
    </view>

    <view class="form-item" @click.stop="hideCustomKeyboard">
      <text class="form-label">备注</text>
      <input
        class="form-input"
        v-model="formData.remark"
        :focus="remarkFocus"
        placeholder="添加备注（可选）"
        confirm-type="done"
        @focus="onRemarkFocus"
      />
    </view>

    <view class="category-section">
      <text class="section-title">选择分类</text>
      <view class="category-grid">
        <view
          v-for="cat in currentCategories"
          :key="cat.name"
          class="category-item"
          :class="{ active: formData.category === cat.name }"
          @click.stop="formData.category = cat.name"
        >
          <text class="category-name">{{ cat.name }}</text>
        </view>
      </view>
    </view>

    <view v-if="showTemplateName && !isEditMode" class="form-item">
      <text class="form-label">模板名称</text>
      <input class="form-input" v-model="templateName" placeholder="如：早餐、打车" @focus="hideCustomKeyboard" />
    </view>

    <view class="button-group">
      <button v-if="!isEditMode" class="save-btn secondary" @click.stop="handleSaveAsTemplate">存为模板</button>
      <button class="save-btn" @click.stop="handleSave">{{ isEditMode ? '保存修改' : '保存' }}</button>
    </view>

    <view v-if="showCustomKeyboard" class="keyboard-overlay" @click="hideCustomKeyboard">
      <view class="keyboard-spacer"></view>
      <view class="keyboard-panel" @click.stop>
        <view class="custom-keyboard-card">
          <view class="keyboard-row">
            <view class="keyboard-key" @click.stop="appendAmount('1')">1</view>
            <view class="keyboard-key" @click.stop="appendAmount('2')">2</view>
            <view class="keyboard-key" @click.stop="appendAmount('3')">3</view>
          </view>
          <view class="keyboard-row">
            <view class="keyboard-key" @click.stop="appendAmount('4')">4</view>
            <view class="keyboard-key" @click.stop="appendAmount('5')">5</view>
            <view class="keyboard-key" @click.stop="appendAmount('6')">6</view>
          </view>
          <view class="keyboard-row">
            <view class="keyboard-key" @click.stop="appendAmount('7')">7</view>
            <view class="keyboard-key" @click.stop="appendAmount('8')">8</view>
            <view class="keyboard-key" @click.stop="appendAmount('9')">9</view>
          </view>
          <view class="keyboard-row">
            <view class="keyboard-key keyboard-key-muted" @click.stop="appendAmount('.')">.</view>
            <view class="keyboard-key" @click.stop="appendAmount('0')">0</view>
            <view class="keyboard-key keyboard-key-muted" @click.stop="deleteAmount">⌫</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
// @ts-ignore
import { useRecordsStore } from '@/stores/records'
// @ts-ignore
import { useTemplateStore } from '@/stores/template'
// @ts-ignore
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/categories'
// @ts-ignore
import { formatDate } from '@/utils'

const recordsStore = useRecordsStore()
const templateStore = useTemplateStore()

const DEFAULT_EXPENSE_CATEGORY = '餐饮'
const DEFAULT_INCOME_CATEGORY = INCOME_CATEGORIES[0].name

const showTemplateName = ref(false)
const templateName = ref('')
const isEditMode = ref(false)
const editRecordId = ref('')
const showCustomKeyboard = ref(false)
const remarkFocus = ref(false)

const formData = reactive({
  type: 'expense' as 'income' | 'expense',
  amount: '',
  category: DEFAULT_EXPENSE_CATEGORY,
  date: formatDate(new Date()),
  time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
  remark: ''
})

const templates = computed(() => templateStore.templates)

const currentCategories = computed(() => {
  return formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
})

const getRecordTimestamp = () => {
  return new Date(`${formData.date}T${formData.time}:00`).getTime()
}

const hideCustomKeyboard = () => {
  showCustomKeyboard.value = false
}

const showAmountKeyboard = () => {
  showCustomKeyboard.value = true
}

const switchType = (type: 'income' | 'expense') => {
  formData.type = type
  formData.category = type === 'income' ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY
}

const onDateChange = (e: any) => {
  formData.date = e.detail.value
}

const onTimeChange = (e: any) => {
  formData.time = e.detail.value
}

const appendAmount = (value: string) => {
  showCustomKeyboard.value = true
  const current = formData.amount || ''

  if (value === '.') {
    if (!current) {
      formData.amount = '0.'
      return
    }
    if (current.includes('.')) {
      return
    }
    formData.amount = `${current}.`
    return
  }

  if (current === '0' && value !== '.') {
    formData.amount = value
    return
  }

  const next = `${current}${value}`
  const decimalPart = next.split('.')[1]
  if (decimalPart && decimalPart.length > 2) {
    return
  }
  formData.amount = next
}

const deleteAmount = () => {
  formData.amount = (formData.amount || '').slice(0, -1)
}

const useTemplate = (tpl: any) => {
  formData.type = tpl.type
  formData.amount = tpl.amount.toString()
  formData.category = tpl.category
  formData.remark = tpl.remark || ''

  uni.showToast({
    title: `已应用模板：${tpl.name}`,
    icon: 'success',
    duration: 1500
  })
}

const deleteTemplate = (id: string) => {
  uni.showModal({
    title: '删除模板',
    content: '确定要删除这个模板吗？',
    success: (res) => {
      if (res.confirm) {
        templateStore.deleteTemplate(id)
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    }
  })
}

const handleSaveAsTemplate = () => {
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }

  if (!formData.category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }

  uni.showModal({
    title: '保存为模板',
    editable: true,
    placeholderText: '请输入模板名称',
    success: (res) => {
      if (res.confirm && res.content) {
        templateStore.addTemplate({
          name: res.content,
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          remark: formData.remark || undefined
        })

        uni.showToast({ title: '模板已保存', icon: 'success' })
      }
    }
  })
}

const handleSave = () => {
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }

  if (!formData.category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }

  const timestamp = getRecordTimestamp()

  if (isEditMode.value) {
    recordsStore.updateRecord(editRecordId.value, {
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      createdAt: timestamp,
      remark: formData.remark || undefined
    })

    uni.showToast({ title: '修改成功', icon: 'success', duration: 300 })
  } else {
    recordsStore.addRecord({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      createdAt: timestamp,
      remark: formData.remark || undefined
    })

    uni.showToast({ title: '保存成功', icon: 'success', duration: 300 })
  }

  hideCustomKeyboard()

  setTimeout(() => {
    uni.navigateBack()
  }, 120)
}

onMounted(() => {
  templateStore.loadFromStorage()

  // @ts-ignore
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  // @ts-ignore
  const options = currentPage.$page.options || {}

  if (options.id) {
    isEditMode.value = true
    editRecordId.value = options.id

    const record = recordsStore.records.find((r: any) => r.id === options.id)
    if (record) {
      const timestamp = record.createdAt || Date.now()
      const date = new Date(timestamp)
      formData.type = record.type
      formData.amount = record.amount.toString()
      formData.category = record.category
      formData.date = record.date
      formData.time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      formData.remark = record.remark || ''
    }
  }

  nextTick(() => {
    remarkFocus.value = true
  })
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.page-header {
  background: white;
  padding: 30rpx 32rpx;
  margin-bottom: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
}

.template-section {
  background: white;
  padding: 24rpx 20rpx;
}

.template-title {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 16rpx;
  display: block;
  padding-left: 10rpx;
}

.template-scroll {
  width: 100%;
  white-space: nowrap;
}

.template-list {
  display: inline-flex;
  gap: 16rpx;
  padding: 0 10rpx;
}

.template-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  min-width: 140rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.template-name {
  font-size: 26rpx;
  color: white;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.template-amount {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.type-tabs {
  display: flex;
  background: white;
  padding: 20rpx;
  gap: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .tab-text {
      color: white;
    }
  }
}

.tab-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #6b7280;
}

.amount-section {
  background: white;
  padding: 40rpx 32rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}

.currency {
  font-size: 64rpx;
  color: #667eea;
  font-weight: bold;
  margin-right: 16rpx;
}

.amount-display {
  flex: 1;
  min-height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #1f2937;
  text-align: center;
}

.category-section {
  background: white;
  padding: 32rpx;
  margin-top: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 24rpx;
  display: block;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.category-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &.active {
    background: #ede9fe;
    border-color: #667eea;

    .category-name {
      color: #667eea;
      font-weight: 600;
    }
  }
}

.category-name {
  font-size: 26rpx;
  color: #4b5563;
}

.form-item {
  background: white;
  padding: 32rpx;
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-size: 28rpx;
  color: #6b7280;
  margin-right: 32rpx;
}

.picker-value {
  font-size: 28rpx;
  color: #1f2937;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
  text-align: right;
}

.button-group {
  padding: 40rpx;
  margin-top: 40rpx;
  display: flex;
  gap: 20rpx;
}

.save-btn {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

  &.secondary {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
  }
}

.keyboard-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.keyboard-spacer {
  flex: 1;
  background: transparent;
}

.keyboard-panel {
  padding: 0 20rpx 20rpx;
}

.custom-keyboard-card {
  background: white;
  padding: 16rpx 20rpx 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 -8rpx 30rpx rgba(15, 23, 42, 0.12);
}

.keyboard-row {
  display: flex;
  gap: 12rpx;
}

.keyboard-row + .keyboard-row {
  margin-top: 12rpx;
}

.keyboard-key {
  flex: 1;
  height: 92rpx;
  border-radius: 18rpx;
  background: #f3f4f6;
  color: #1f2937;
  font-size: 40rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyboard-key-muted {
  background: #e9edf5;
}
</style>
