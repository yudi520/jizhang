<template>
  <LockScreen />
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import LockScreen from '@/components/LockScreen.vue'

onLaunch(() => {
  console.log('App Launch')
  
  // 监听 Cordova deviceready 事件
  document.addEventListener('deviceready', () => {
    console.log('Cordova deviceready')
    
    // 设置状态栏颜色
    // @ts-ignore
    if (window.StatusBar) {
      console.log('StatusBar plugin found')
      // @ts-ignore
      window.StatusBar.backgroundColorByHexString('#667eea')
      // @ts-ignore
      window.StatusBar.styleLightContent()
      // @ts-ignore
      window.StatusBar.show()
    } else {
      console.log('StatusBar plugin not found')
    }
  }, false)
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
page {
  background-color: #f8f8f8;
  font-size: 14px;
  line-height: 1.5;
}
</style>

