<template>
  <LockScreen />
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import LockScreen from '@/components/LockScreen.vue'

onLaunch(() => {
  console.log('App Launch')
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

