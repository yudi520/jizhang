<template>
  <view class="container">
    <!-- 当前账户 -->
    <view class="current-account">
      <text class="section-title">当前账户</text>
      <view v-if="currentAccount" class="account-card current">
        <view class="account-icon" :style="{ background: currentAccount.color }">
          <text class="icon-text">{{ currentAccount.icon }}</text>
        </view>
        <view class="account-info">
          <text class="account-name">{{ currentAccount.name }}</text>
          <text class="account-balance">¥{{ currentAccount.balance.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 所有账户 -->
    <view class="accounts-section">
      <view class="section-header">
        <text class="accounts-title">所有账户</text>
        <button class="add-btn" @click="showAddDialog = true">+ 添加</button>
      </view>

      <view class="accounts-list">
        <view 
          v-for="account in accounts" 
          :key="account.id"
          class="account-card"
          :class="{ active: account.id === currentAccountId }"
          @click="handleSwitchAccount(account.id)"
        >
          <view class="account-icon" :style="{ background: account.color }">
            <text class="icon-text">{{ account.icon }}</text>
          </view>
          <view class="account-info">
            <text class="account-name">{{ account.name }}</text>
            <text class="account-balance">¥{{ account.balance.toFixed(2) }}</text>
          </view>
          <view class="account-actions">
            <text class="action-btn" @click.stop="handleEdit(account)">✏️</text>
            <text 
              v-if="accounts.length > 1"
              class="action-btn delete" 
              @click.stop="handleDelete(account.id)"
            >🗑️</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑账户对话框 -->
    <view v-if="showAddDialog" class="dialog-mask" @click="showAddDialog = false">
      <view class="dialog-content" @click.stop>
        <text class="dialog-title">{{ editingAccount ? '编辑账户' : '添加账户' }}</text>
        
        <view class="form-section">
          <view class="form-item">
            <text class="form-label">账户名称</text>
            <input 
              class="form-input" 
              v-model="formData.name"
              placeholder="例如：支付宝、微信、银行卡"
            />
          </view>

          <view class="form-item">
            <text class="form-label">初始余额</text>
            <input 
              class="form-input" 
              type="digit"
              v-model="formData.balance"
              placeholder="0.00"
            />
          </view>

          <view class="form-item">
            <text class="form-label">图标</text>
            <view class="icon-selector">
              <view 
                v-for="icon in iconOptions" 
                :key="icon"
                class="icon-option"
                :class="{ active: formData.icon === icon }"
                @click="formData.icon = icon"
              >
                <text>{{ icon }}</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">颜色</text>
            <view class="color-selector">
              <view 
                v-for="color in colorOptions" 
                :key="color"
                class="color-option"
                :class="{ active: formData.color === color }"
                :style="{ background: color }"
                @click="formData.color = color"
              ></view>
            </view>
          </view>
        </view>

        <view class="dialog-buttons">
          <button class="dialog-btn cancel" @click="showAddDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="handleSave">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, reactive, computed, onMounted } from 'vue'
// @ts-ignore
import { useAccountStore } from '@/stores/account'

const accountStore = useAccountStore()

const showAddDialog = ref(false)
const editingAccount = ref<any>(null)
const formData = reactive({
  name: '',
  balance: '',
  icon: '💰',
  color: '#667eea'
})

const iconOptions = ['💰', '💳', '🏦', '📱', '💵', '💴', '💶', '💷', '🪙', '💎']
const colorOptions = ['#667eea', '#f093fb', '#4ade80', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#fb923c']

const accounts = computed(() => accountStore.accounts)
const currentAccountId = computed(() => accountStore.currentAccountId)
const currentAccount = computed(() => accountStore.getCurrentAccount())

const handleSwitchAccount = (id: string) => {
  accountStore.switchAccount(id)
  uni.showToast({
    title: '切换成功',
    icon: 'success'
  })
}

const handleEdit = (account: any) => {
  editingAccount.value = account
  formData.name = account.name
  formData.balance = account.balance.toString()
  formData.icon = account.icon
  formData.color = account.color
  showAddDialog.value = true
}

const handleDelete = (id: string) => {
  uni.showModal({
    title: '删除账户',
    content: '确定要删除这个账户吗？删除后该账户的记录将无法关联。',
    success: (res) => {
      if (res.confirm) {
        const success = accountStore.deleteAccount(id)
        if (success) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '至少保留一个账户',
            icon: 'none'
          })
        }
      }
    }
  })
}

const handleSave = () => {
  if (!formData.name.trim()) {
    uni.showToast({
      title: '请输入账户名称',
      icon: 'none'
    })
    return
  }

  if (editingAccount.value) {
    // 编辑
    accountStore.updateAccount(editingAccount.value.id, {
      name: formData.name,
      balance: parseFloat(formData.balance) || 0,
      icon: formData.icon,
      color: formData.color
    })
    uni.showToast({
      title: '更新成功',
      icon: 'success'
    })
  } else {
    // 添加
    accountStore.addAccount({
      name: formData.name,
      balance: parseFloat(formData.balance) || 0,
      icon: formData.icon,
      color: formData.color
    })
    uni.showToast({
      title: '添加成功',
      icon: 'success'
    })
  }

  showAddDialog.value = false
  editingAccount.value = null
  formData.name = ''
  formData.balance = ''
  formData.icon = '💰'
  formData.color = '#667eea'
}

onMounted(() => {
  accountStore.loadFromStorage()
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.current-account {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 16rpx;
  display: block;
}

.account-card {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s;

  &.current {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

    .account-name,
    .account-balance {
      color: white;
    }
  }

  &.active {
    border: 3rpx solid #667eea;
  }
}

.account-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 48rpx;
}

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.account-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.account-balance {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
}

.account-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  font-size: 32rpx;
  padding: 8rpx;
}

.accounts-section {
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

.accounts-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  flex: 1;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  font-weight: 600;
  margin-left: auto;
}

.accounts-list {
  display: flex;
  flex-direction: column;
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

.form-section {
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1f2937;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.icon-option {
  width: 80rpx;
  height: 80rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: #667eea;
    background: #eef2ff;
  }
}

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.color-option {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: #1f2937;
    transform: scale(1.1);
  }
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
}

.dialog-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
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
</style>






