// @ts-ignore
import { defineStore } from 'pinia'
// @ts-ignore
import { ref } from 'vue'
// @ts-ignore
import { generateId } from '@/utils'

export interface Template {
  id: string
  name: string
  type: 'income' | 'expense'
  category: string
  amount: number
  remark?: string
  createdAt: number
}

// @ts-ignore
const refFn = ref

const STORAGE_KEY = 'templates'

export const useTemplateStore = defineStore('template', () => {
  // @ts-ignore
  const templates = refFn<Template[]>([])

  // 加载本地存储
  function loadFromStorage() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      if (stored) {
        templates.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(templates.value))
    } catch (error) {
      console.error('保存模板失败:', error)
    }
  }

  // 添加模板
  function addTemplate(template: Omit<Template, 'id' | 'createdAt'>) {
    const newTemplate: Template = {
      ...template,
      id: generateId(),
      createdAt: Date.now()
    }
    templates.value.unshift(newTemplate)
    saveToStorage()
    return newTemplate
  }

  // 删除模板
  function deleteTemplate(id: string) {
    const index = templates.value.findIndex((t: Template) => t.id === id)
    if (index !== -1) {
      templates.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  // 使用模板
  function useTemplate(id: string) {
    return templates.value.find((t: Template) => t.id === id)
  }

  // 清空所有模板
  function clearTemplates() {
    templates.value = []
    saveToStorage()
  }

  // 导入模板
  function importTemplates(importedTemplates: Template[]) {
    templates.value = importedTemplates
    saveToStorage()
  }

  return {
    templates,
    loadFromStorage,
    addTemplate,
    deleteTemplate,
    useTemplate,
    clearTemplates,
    importTemplates
  }
})






