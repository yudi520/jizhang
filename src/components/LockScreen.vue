<template>
  <view class="lock-screen" v-if="isLocked">
    <view class="lock-container">
      <text class="lock-icon">🔒</text>
      <text class="lock-title">输入密码解锁</text>
      
      <view class="password-dots">
        <view 
          v-for="i in 6" 
          :key="i"
          class="dot"
          :class="{ filled: password.length >= i }"
        ></view>
      </view>

      <view class="error-message" v-if="errorMessage">
        <text>{{ errorMessage }}</text>
      </view>

      <view class="keypad">
        <view 
          v-for="num in [1,2,3,4,5,6,7,8,9]" 
          :key="num"
          class="key"
          @click="inputNumber(num)"
        >
          <text class="key-text">{{ num }}</text>
        </view>
        <view class="key empty"></view>
        <view class="key" @click="inputNumber(0)">
          <text class="key-text">0</text>
        </view>
        <view class="key delete" @click="deleteNumber">
          <text class="key-text">⌫</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, onMounted } from 'vue'
// @ts-ignore
import { useLockStore } from '@/stores/lock'

const lockStore = useLockStore()
const password = ref('')
const errorMessage = ref('')

const isLocked = ref(false)

const inputNumber = (num: number) => {
  if (password.value.length < 6) {
    password.value += num.toString()
    errorMessage.value = ''
    
    if (password.value.length === 6) {
      verifyPassword()
    }
  }
}

const deleteNumber = () => {
  if (password.value.length > 0) {
    password.value = password.value.slice(0, -1)
    errorMessage.value = ''
  }
}

const verifyPassword = () => {
  if (lockStore.verifyPassword(password.value)) {
    lockStore.unlock()
    isLocked.value = false
    uni.showToast({
      title: '解锁成功',
      icon: 'success'
    })
  } else {
    errorMessage.value = '密码错误，请重试'
    password.value = ''
    
    // 震动反馈
    uni.vibrateShort({})
  }
}

onMounted(() => {
  lockStore.loadFromStorage()
  isLocked.value = lockStore.isLocked
})
</script>

<style lang="scss">
.lock-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lock-container {
  width: 100%;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lock-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.lock-title {
  font-size: 36rpx;
  color: white;
  font-weight: 600;
  margin-bottom: 80rpx;
}

.password-dots {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s;

  &.filled {
    background: white;
    border-color: white;
  }
}

.error-message {
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;

  text {
    color: #fca5a5;
    font-size: 26rpx;
  }
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  width: 100%;
  max-width: 600rpx;
}

.key {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:active {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  }

  &.empty {
    background: transparent;
  }

  &.delete {
    background: rgba(255, 255, 255, 0.15);
  }
}

.key-text {
  font-size: 48rpx;
  color: white;
  font-weight: 500;
}
</style>






