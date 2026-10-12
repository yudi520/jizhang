<template>
  <view class="container">
    <view class="header">
      <text class="title">密码锁定</text>
      <text class="desc">保护您的隐私数据</text>
    </view>

    <!-- 锁定状态 -->
    <view class="lock-status">
      <view class="status-card" :class="{ enabled: lockEnabled }">
        <text class="status-icon">{{ lockEnabled ? '🔒' : '🔓' }}</text>
        <text class="status-text">{{ lockEnabled ? '已启用' : '未启用' }}</text>
      </view>
    </view>

    <!-- 设置选项 -->
    <view class="settings-section">
      <view v-if="!lockEnabled" class="setting-item" @click="showSetPasswordDialog = true">
        <text class="setting-label">启用密码锁</text>
        <text class="setting-arrow">›</text>
      </view>

      <view v-if="lockEnabled" class="setting-item" @click="showChangePasswordDialog = true">
        <text class="setting-label">修改密码</text>
        <text class="setting-arrow">›</text>
      </view>

      <view v-if="lockEnabled" class="setting-item" @click="handleDisableLock">
        <text class="setting-label danger">关闭密码锁</text>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 说明 -->
    <view class="info-section">
      <text class="info-title">使用说明</text>
      <text class="info-text">• 启用后，每次打开应用需要输入密码</text>
      <text class="info-text">• 密码为6位数字</text>
      <text class="info-text">• 请牢记密码，忘记后需要重新安装应用</text>
    </view>

    <!-- 设置密码对话框 -->
    <view v-if="showSetPasswordDialog" class="dialog-mask" @click="showSetPasswordDialog = false">
      <view class="dialog-content" @click.stop>
        <text class="dialog-title">设置密码</text>
        
        <view class="password-input-section">
          <text class="input-label">输入6位数字密码</text>
          <input 
            class="password-input" 
            type="number"
            maxlength="6"
            v-model="newPassword"
            placeholder="请输入密码"
          />
        </view>

        <view class="password-input-section">
          <text class="input-label">确认密码</text>
          <input 
            class="password-input" 
            type="number"
            maxlength="6"
            v-model="confirmPassword"
            placeholder="请再次输入密码"
          />
        </view>

        <view class="dialog-buttons">
          <button class="dialog-btn cancel" @click="showSetPasswordDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="handleSetPassword">确定</button>
        </view>
      </view>
    </view>

    <!-- 修改密码对话框 -->
    <view v-if="showChangePasswordDialog" class="dialog-mask" @click="showChangePasswordDialog = false">
      <view class="dialog-content" @click.stop>
        <text class="dialog-title">修改密码</text>
        
        <view class="password-input-section">
          <text class="input-label">当前密码</text>
          <input 
            class="password-input" 
            type="number"
            maxlength="6"
            v-model="oldPassword"
            placeholder="请输入当前密码"
          />
        </view>

        <view class="password-input-section">
          <text class="input-label">新密码</text>
          <input 
            class="password-input" 
            type="number"
            maxlength="6"
            v-model="newPassword"
            placeholder="请输入新密码"
          />
        </view>

        <view class="password-input-section">
          <text class="input-label">确认新密码</text>
          <input 
            class="password-input" 
            type="number"
            maxlength="6"
            v-model="confirmPassword"
            placeholder="请再次输入新密码"
          />
        </view>

        <view class="dialog-buttons">
          <button class="dialog-btn cancel" @click="showChangePasswordDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="handleChangePassword">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, computed, onMounted } from 'vue'
// @ts-ignore
import { useLockStore } from '@/stores/lock'

const lockStore = useLockStore()

const showSetPasswordDialog = ref(false)
const showChangePasswordDialog = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const lockEnabled = computed(() => lockStore.lockSettings.enabled)

const handleSetPassword = () => {
  if (!newPassword.value || newPassword.value.length !== 6) {
    uni.showToast({
      title: '请输入6位数字密码',
      icon: 'none'
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({
      title: '两次密码不一致',
      icon: 'none'
    })
    return
  }

  lockStore.setPassword(newPassword.value)
  
  uni.showToast({
    title: '密码设置成功',
    icon: 'success'
  })

  newPassword.value = ''
  confirmPassword.value = ''
  showSetPasswordDialog.value = false
}

const handleChangePassword = () => {
  if (!oldPassword.value || oldPassword.value.length !== 6) {
    uni.showToast({
      title: '请输入当前密码',
      icon: 'none'
    })
    return
  }

  if (!newPassword.value || newPassword.value.length !== 6) {
    uni.showToast({
      title: '请输入6位数字新密码',
      icon: 'none'
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({
      title: '两次密码不一致',
      icon: 'none'
    })
    return
  }

  const success = lockStore.changePassword(oldPassword.value, newPassword.value)
  
  if (success) {
    uni.showToast({
      title: '密码修改成功',
      icon: 'success'
    })
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showChangePasswordDialog.value = false
  } else {
    uni.showToast({
      title: '当前密码错误',
      icon: 'none'
    })
  }
}

const handleDisableLock = () => {
  uni.showModal({
    title: '关闭密码锁',
    content: '确定要关闭密码锁吗？',
    success: (res) => {
      if (res.confirm) {
        lockStore.disableLock()
        uni.showToast({
          title: '已关闭密码锁',
          icon: 'success'
        })
      }
    }
  })
}

onMounted(() => {
  lockStore.loadFromStorage()
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 60rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #1f2937;
  display: block;
  margin-bottom: 16rpx;
}

.desc {
  font-size: 28rpx;
  color: #9ca3af;
}

.lock-status {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.status-card {
  background: white;
  border-radius: 24rpx;
  padding: 60rpx 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &.enabled {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .status-text {
      color: white;
    }
  }
}

.status-icon {
  font-size: 96rpx;
}

.status-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.settings-section {
  background: white;
  border-radius: 24rpx;
  padding: 0 32rpx;
  margin-bottom: 30rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
}

.setting-label {
  font-size: 28rpx;
  color: #1f2937;

  &.danger {
    color: #ef4444;
  }
}

.setting-arrow {
  font-size: 32rpx;
  color: #9ca3af;
}

.info-section {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
  display: block;
}

.info-text {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 48rpx;
  display: block;
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

.password-input-section {
  margin-bottom: 24rpx;
}

.input-label {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
  display: block;
}

.password-input {
  width: 100%;
  padding: 24rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #1f2937;
  text-align: center;
  letter-spacing: 8rpx;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
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






