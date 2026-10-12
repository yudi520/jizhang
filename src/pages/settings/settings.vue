<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar">
        <text class="avatar-text">记</text>
      </view>
      <text class="user-name">记账应用</text>
      <text class="user-desc">简单好用的记账工具</text>
    </view>

    <!-- 设置列表 -->
    <view class="settings-section">
      <view class="setting-item" @click="handleAccountManage">
        <text class="setting-label">账户管理</text>
        <text class="setting-arrow">›</text>
      </view>
      <view class="setting-item" @click="handleLockSettings">
        <text class="setting-label">密码锁定</text>
        <text class="setting-arrow">›</text>
      </view>
      <view class="setting-item" @click="handleExportData">
        <text class="setting-label">导出数据</text>
        <text class="setting-arrow">›</text>
      </view>
      <view class="setting-item" @click="handleImportData">
        <text class="setting-label">导入数据</text>
        <text class="setting-arrow">›</text>
      </view>
      <view class="setting-item" @click="showClearDialog = true">
        <text class="setting-label danger">清空所有数据</text>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <text class="section-title">数据统计</text>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ recordCount }}</text>
          <text class="stat-label">记录数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ budgetCount }}</text>
          <text class="stat-label">预算数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ templateCount }}</text>
          <text class="stat-label">模板数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ daysUsed }}</text>
          <text class="stat-label">使用天数</text>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="about-section">
      <text class="about-title">关于应用</text>
      <text class="about-text">版本：1.0.0</text>
      <text class="about-text">一个简单实用的记账应用</text>
    </view>

    <!-- 清空确认对话框 -->
    <view v-if="showClearDialog" class="dialog-mask" @click="showClearDialog = false">
      <view class="dialog-content" @click.stop>
        <text class="dialog-title">确认清空</text>
        <text class="dialog-message">此操作将清空所有记录和预算数据，且无法恢复。确定要继续吗？</text>
        <view class="dialog-buttons">
          <button class="dialog-btn cancel" @click="showClearDialog = false">取消</button>
          <button class="dialog-btn confirm danger" @click="handleClearData">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, computed, onMounted } from 'vue'
// @ts-ignore
import { useRecordsStore } from '@/stores/records'
// @ts-ignore
import { useBudgetStore } from '@/stores/budget'
// @ts-ignore
import { useTemplateStore } from '@/stores/template'
// @ts-ignore
import { formatDateTime } from '@/utils'

const recordsStore = useRecordsStore()
const budgetStore = useBudgetStore()
const templateStore = useTemplateStore()

const showClearDialog = ref(false)

const recordCount = computed(() => recordsStore.records.length)
const budgetCount = computed(() => budgetStore.budgets.length)
const templateCount = computed(() => templateStore.templates.length)

const daysUsed = computed(() => {
  if (recordsStore.records.length === 0) return 0
  const dates = new Set(recordsStore.records.map((r: any) => r.date))
  return dates.size
})

const handleAccountManage = () => {
  uni.navigateTo({
    url: '/pages/account/account'
  })
}

const handleLockSettings = () => {
  uni.navigateTo({
    url: '/pages/lock-settings/lock-settings'
  })
}

const handleExportData = () => {
  // 统计数据
  let totalIncome = 0
  let totalExpense = 0
  const incomeByCategory: { [key: string]: number } = {}
  const expenseByCategory: { [key: string]: number } = {}
  
  recordsStore.records.forEach((record: any) => {
    if (record.type === 'income') {
      totalIncome += record.amount
      incomeByCategory[record.category] = (incomeByCategory[record.category] || 0) + record.amount
    } else {
      totalExpense += record.amount
      expenseByCategory[record.category] = (expenseByCategory[record.category] || 0) + record.amount
    }
  })
  
  // 生成 CSV 格式的记录数据
  let csvContent = '=== 统计汇总 ===\n'
  csvContent += `总收入,${totalIncome.toFixed(2)}\n`
  csvContent += `总支出,${totalExpense.toFixed(2)}\n`
  csvContent += `结余,${(totalIncome - totalExpense).toFixed(2)}\n`
  
  // 收入分类统计
  csvContent += '\n收入分类统计\n'
  csvContent += '分类,金额\n'
  Object.entries(incomeByCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      csvContent += `${category},${amount.toFixed(2)}\n`
    })
  
  // 支出分类统计
  csvContent += '\n支出分类统计\n'
  csvContent += '分类,金额\n'
  Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      csvContent += `${category},${amount.toFixed(2)}\n`
    })
  
  // 记账记录
  csvContent += '\n=== 记账记录 ===\n'
  csvContent += '日期时间,类型,分类,金额,备注\n'
  
  recordsStore.records.forEach((record: any) => {
    const type = record.type === 'income' ? '收入' : '支出'
    const dateTime = record.createdAt ? formatDateTime(record.createdAt) : record.date
    csvContent += `${dateTime},${type},${record.category},${record.amount},${record.remark || ''}\n`
  })
  
  // 预算数据
  csvContent += '\n=== 预算数据 ===\n'
  csvContent += '分类,预算金额,已使用,剩余\n'
  
  budgetStore.budgets.forEach((budget: any) => {
    const remaining = (budget.budgetAmount || 0) - (budget.spentAmount || 0)
    csvContent += `${budget.category},${budget.budgetAmount || 0},${budget.spentAmount || 0},${remaining}\n`
  })
  
  // 模板数据
  csvContent += '\n=== 模板数据 ===\n'
  csvContent += '模板名称,类型,分类,金额,备注\n'
  
  templateStore.templates.forEach((template: any) => {
    const type = template.type === 'income' ? '收入' : '支出'
    csvContent += `${template.name},${type},${template.category},${template.amount},${template.remark || ''}\n`
  })
  
  csvContent += `\n导出时间: ${new Date().toLocaleString('zh-CN')}\n`
  
  const fileName = `记账数据_${new Date().toISOString().split('T')[0]}.csv`
  
  // 添加 UTF-8 BOM 头
  const contentWithBOM = '\ufeff' + csvContent
  
  // 检测环境
  // @ts-ignore
  const hasCordova = typeof window.cordova !== 'undefined'
  // @ts-ignore
  const hasResolveLocalFileSystemURL = typeof window.resolveLocalFileSystemURL !== 'undefined'
  
  // Cordova 环境
  if (hasCordova && hasResolveLocalFileSystemURL) {
    uni.showLoading({
      title: '正在导出...',
      mask: true
    })
    
    // 尝试多个可能的下载目录路径
    // @ts-ignore
    const possiblePaths = [
      // Android 公共下载目录
      // @ts-ignore
      cordova.file.externalRootDirectory + 'Download/',
      // @ts-ignore
      cordova.file.externalDataDirectory,
      // @ts-ignore
      cordova.file.dataDirectory
    ]
    
    let currentPathIndex = 0
    
    const tryNextPath = () => {
      if (currentPathIndex >= possiblePaths.length) {
        uni.hideLoading()
        uni.showToast({
          title: '无法访问存储目录，请检查权限',
          icon: 'none',
          duration: 3000
        })
        return
      }
      
      const targetPath = possiblePaths[currentPathIndex]
      console.log('尝试路径:', targetPath)
      
      // @ts-ignore
      window.resolveLocalFileSystemURL(targetPath, (dirEntry: any) => {
        dirEntry.getFile(fileName, { create: true, exclusive: false }, (fileEntry: any) => {
          fileEntry.createWriter((writer: any) => {
            writer.onwriteend = () => {
              uni.hideLoading()
              
              const filePath = fileEntry.nativeURL || fileEntry.toURL()
              const displayPath = currentPathIndex === 0 ? '下载文件夹' : '应用数据目录'
              
              uni.showModal({
                title: '导出成功',
                content: `文件已保存到${displayPath}\n\n文件名：${fileName}\n\n路径：${filePath}`,
                confirmText: '复制路径',
                cancelText: '关闭',
                success: (res: any) => {
                  if (res.confirm) {
                    uni.setClipboardData({
                      data: filePath,
                      success: () => {
                        uni.showToast({
                          title: '路径已复制',
                          icon: 'success'
                        })
                      }
                    })
                  }
                }
              })
            }
            
            writer.onerror = (error: any) => {
              console.error('写入失败:', error)
              // 尝试下一个路径
              currentPathIndex++
              tryNextPath()
            }
            
            // 写入内容
            const blob = new Blob([contentWithBOM], { type: 'text/csv;charset=utf-8' })
            writer.write(blob)
          }, (error: any) => {
            console.error('创建写入器失败:', error)
            // 尝试下一个路径
            currentPathIndex++
            tryNextPath()
          })
        }, (error: any) => {
          console.error('创建文件失败:', error)
          // 尝试下一个路径
          currentPathIndex++
          tryNextPath()
        })
      }, (error: any) => {
        console.error('无法访问目录:', error)
        // 尝试下一个路径
        currentPathIndex++
        tryNextPath()
      })
    }
    
    // 开始尝试
    tryNextPath()
  } else {
    // 浏览器环境 - 直接下载
    const blob = new Blob([contentWithBOM], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    uni.showToast({
      title: '导出成功',
      icon: 'success'
    })
  }
}

const parseAndImportData = (content: string) => {
  console.log('=== 开始导入 ===')
  console.log('内容长度:', content.length)
  console.log('内容预览:', content.substring(0, 200))
  
  try {
    // 尝试解析 CSV 格式
    const lines = content.trim().split('\n')
    console.log('总行数:', lines.length)
    
    let isRecordSection = false
    let isBudgetSection = false
    let isTemplateSection = false
    const records: any[] = []
    const budgets: any[] = []
    const templates: any[] = []
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return
      
      // 跳过统计汇总部分
      if (trimmedLine.includes('=== 统计汇总 ===') || 
          trimmedLine.includes('总收入,') || 
          trimmedLine.includes('总支出,') || 
          trimmedLine.includes('结余,') ||
          trimmedLine.includes('收入分类统计') ||
          trimmedLine.includes('支出分类统计')) {
        console.log(`第${index}行: 跳过统计信息`)
        return
      }
      
      if (trimmedLine.includes('记账记录') || trimmedLine.includes('=== 记账记录 ===')) {
        console.log(`第${index}行: 找到记账记录标题`)
        isRecordSection = true
        isBudgetSection = false
        isTemplateSection = false
        return
      }
      if (trimmedLine.includes('预算数据') || trimmedLine.includes('=== 预算数据 ===')) {
        console.log(`第${index}行: 找到预算数据标题`)
        isRecordSection = false
        isBudgetSection = true
        isTemplateSection = false
        return
      }
      if (trimmedLine.includes('模板数据') || trimmedLine.includes('=== 模板数据 ===')) {
        console.log(`第${index}行: 找到模板数据标题`)
        isRecordSection = false
        isBudgetSection = false
        isTemplateSection = true
        return
      }
      if (trimmedLine.includes('导出时间')) {
        console.log(`第${index}行: 找到导出时间`)
        isRecordSection = false
        isBudgetSection = false
        isTemplateSection = false
        return
      }
      
      // 跳过标题行和分类统计数据行
      if (trimmedLine.includes('日期,类型') || 
          trimmedLine.includes('日期时间,类型') || 
          trimmedLine.includes('分类,预算金额') ||
          trimmedLine.includes('模板名称,类型') ||
          trimmedLine.includes('分类,金额')) {
        console.log(`第${index}行: 跳过标题行`)
        return
      }
      
      // 解析数据行
      const parts = trimmedLine.split(',')
      
      // 跳过分类统计数据（只有2个字段且不在记录或预算或模板部分）
      if (!isRecordSection && !isBudgetSection && !isTemplateSection && parts.length === 2) {
        console.log(`第${index}行: 跳过分类统计数据`)
        return
      }
      
      if (isRecordSection) {
        // CSV格式：日期时间,类型,分类,金额,备注 或 日期,类型,分类,金额,备注（兼容旧格式）
        // 前4个字段不会包含逗号，备注可能包含逗号
        const parts = trimmedLine.split(',')
        console.log(`第${index}行 [记录]: ${parts.length}个字段`, parts)
        if (parts.length >= 4) {
          const dateTimeStr = parts[0].trim()
          const typeStr = parts[1].trim()
          const category = parts[2].trim()
          const amount = parseFloat(parts[3])

          // 备注是第5个字段之后的内容，合并回来（因为可能包含逗号）
          const remark = parts.slice(4).join(',').trim()

          if (!isNaN(amount) && amount > 0) {
            // 解析日期时间字符串，转换为时间戳
            let createdAt = Date.now()
            let date = dateTimeStr
            
            try {
              // 检查是否包含时间部分（包含空格和冒号）
              if (dateTimeStr.includes(' ') && dateTimeStr.includes(':')) {
                // 新格式：包含时分秒 "YYYY-MM-DD HH:mm:ss"
                date = dateTimeStr.split(' ')[0] // 提取日期部分
                const parsedDate = new Date(dateTimeStr.replace(' ', 'T'))
                if (!isNaN(parsedDate.getTime())) {
                  createdAt = parsedDate.getTime()
                  console.log('✓ 解析新格式日期时间:', dateTimeStr, '→', createdAt)
                }
              } else {
                // 旧格式：只有日期 "YYYY-MM-DD"
                date = dateTimeStr
                // 使用日期的开始时间（00:00:00）作为时间戳
                const parsedDate = new Date(dateTimeStr + 'T00:00:00')
                if (!isNaN(parsedDate.getTime())) {
                  createdAt = parsedDate.getTime()
                  console.log('✓ 解析旧格式日期:', dateTimeStr, '→', createdAt)
                } else {
                  console.log('⚠ 日期解析失败，使用当前时间')
                }
              }
            } catch (e) {
              console.log('⚠ 日期时间解析异常，使用当前时间:', e)
            }
            
            const record = {
              id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index,
              date: date,
              type: typeStr === '收入' ? 'income' : 'expense',
              category: category,
              amount: amount,
              remark: remark,
              createdAt: createdAt
            }
            records.push(record)
            console.log('✓ 添加记录:', record)
          } else {
            console.log('✗ 金额无效:', parts[3])
          }
        }
      }
      
      if (isBudgetSection) {
        // CSV格式：分类,预算金额,已使用,剩余
        const parts = trimmedLine.split(',')
        console.log(`第${index}行 [预算]: ${parts.length}个字段`, parts)
        if (parts.length >= 2) {
          const budgetAmount = parseFloat(parts[1])
          const spentAmount = parts[2] ? parseFloat(parts[2]) : 0
          if (!isNaN(budgetAmount) && budgetAmount > 0) {
            const budget = {
              id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index,
              category: parts[0].trim(),
              budgetAmount: budgetAmount,
              spentAmount: isNaN(spentAmount) ? 0 : spentAmount,
              period: 'month',
              createdAt: Date.now()
            }
            budgets.push(budget)
            console.log('✓ 添加预算:', budget)
          } else {
            console.log('✗ 预算金额无效:', parts[1])
          }
        }
      }
      
      if (isTemplateSection) {
        // CSV格式：模板名称,类型,分类,金额,备注
        const parts = trimmedLine.split(',')
        console.log(`第${index}行 [模板]: ${parts.length}个字段`, parts)
        if (parts.length >= 4) {
          const name = parts[0].trim()
          const typeStr = parts[1].trim()
          const category = parts[2].trim()
          const amount = parseFloat(parts[3])
          const remark = parts.slice(4).join(',').trim()
          
          if (!isNaN(amount) && amount > 0 && name) {
            const template = {
              id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index,
              name: name,
              type: typeStr === '收入' ? 'income' : 'expense',
              category: category,
              amount: amount,
              remark: remark || undefined,
              createdAt: Date.now()
            }
            templates.push(template)
            console.log('✓ 添加模板:', template)
          } else {
            console.log('✗ 模板数据无效:', parts)
          }
        }
      }
    })
    
    console.log('=== 解析完成 ===')
    console.log('记录数:', records.length)
    console.log('预算数:', budgets.length)
    console.log('模板数:', templates.length)
    
    if (records.length === 0 && budgets.length === 0 && templates.length === 0) {
      console.error('❌ 未找到有效数据')
      uni.showToast({
        title: '文件中没有有效数据',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 先清空现有数据
    console.log('清空现有数据...')
    recordsStore.clearRecords()
    budgetStore.clearBudgets()
    templateStore.clearTemplates()
    console.log('清空完成')
    
    // 导入新数据
    if (records.length > 0) {
      console.log('导入', records.length, '条记录...')
      recordsStore.importRecords(records)
      console.log('记录导入完成')
    }
    
    if (budgets.length > 0) {
      console.log('导入', budgets.length, '个预算...')
      budgetStore.importBudgets(budgets)
      console.log('预算导入完成')
    }
    
    if (templates.length > 0) {
      console.log('导入', templates.length, '个模板...')
      templateStore.importTemplates(templates)
      console.log('模板导入完成')
    }
    
    // 重新加载验证
    console.log('重新加载数据...')
    recordsStore.loadFromStorage()
    budgetStore.loadFromStorage()
    templateStore.loadFromStorage()
    
    console.log('验证: 当前记录数=', recordsStore.records.length)
    console.log('验证: 当前预算数=', budgetStore.budgets.length)
    console.log('验证: 当前模板数=', templateStore.templates.length)
    
    console.log('=== 导入成功 ===')
    
    // 构建提示信息
    const messages = []
    if (records.length > 0) messages.push(`${records.length}条记录`)
    if (budgets.length > 0) messages.push(`${budgets.length}个预算`)
    if (templates.length > 0) messages.push(`${templates.length}个模板`)
    
    uni.showToast({
      title: `导入成功: ${messages.join(', ')}`,
      icon: 'success',
      duration: 2500
    })
    
  } catch (error) {
    console.error('❌ CSV解析失败:', error)
    uni.showToast({
      title: '导入失败: ' + error,
      icon: 'none',
      duration: 2000
    })
  }
}

const handleImportData = () => {
  // 动态创建 input 元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv,text/csv,text/plain,*/*'
  input.style.position = 'fixed'
  input.style.top = '-100px'
  input.style.left = '-100px'
  input.style.opacity = '0'

  // 绑定 change 事件
  input.onchange = (e: any) => {
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      
      uni.showLoading({
        title: '正在读取文件...',
        mask: true
      })
      
      const reader = new FileReader()
      reader.onload = (event: any) => {
        uni.hideLoading()
        
        let content = event.target.result

        // 处理UTF-8 BOM头
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.substring(1)
        }

        parseAndImportData(content)

        // 移除临时元素
        try {
          document.body.removeChild(input)
        } catch (e) {}
      }
      reader.onerror = (error) => {
        uni.hideLoading()
        uni.showToast({
          title: '读取文件失败',
          icon: 'none',
          duration: 2000
        })
        try {
          document.body.removeChild(input)
        } catch (e) {}
      }
      reader.readAsText(file, 'UTF-8')
    } else {
      try {
        document.body.removeChild(input)
      } catch (e) {}
    }
  }

  // 添加到 DOM 并触发点击
  document.body.appendChild(input)
  
  // 延迟触发点击，确保元素已添加到 DOM
  setTimeout(() => {
    input.click()
  }, 100)
}

const handleClearData = () => {
  recordsStore.clearRecords()
  budgetStore.clearBudgets()
  templateStore.clearTemplates()
  
  uni.showToast({
    title: '数据已清空',
    icon: 'success'
  })
  
  showClearDialog.value = false
}

onMounted(() => {
  recordsStore.loadFromStorage()
  budgetStore.loadFromStorage()
  templateStore.loadFromStorage()
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.avatar-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 12rpx;
}

.user-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.settings-section {
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f9fafb;
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
  font-size: 40rpx;
  color: #d1d5db;
  font-weight: 300;
}

.stats-section {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 24rpx;
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
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

.about-section {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16rpx;
}

.about-text {
  font-size: 24rpx;
  color: #9ca3af;
  margin-bottom: 8rpx;
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
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24rpx;
  display: block;
  text-align: center;
}

.dialog-message {
  font-size: 28rpx;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 32rpx;
  display: block;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
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

    &.danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
  }
}
</style>
