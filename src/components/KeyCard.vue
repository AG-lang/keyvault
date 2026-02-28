<template>
  <div class="key-card" :class="{ 'key-card-pinned': item.pinned }">
    <div class="key-card-header">
      <div class="key-info">
        <button class="btn-icon btn-pin" :class="{ pinned: item.pinned }" @click="$emit('togglePin', item.id)" title="置顶">
          <svg width="14" height="14" viewBox="0 0 24 24" :fill="item.pinned ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </button>
        <span class="key-name">{{ item.name }}</span>
        <span class="key-group-badge">{{ item.group }}</span>
      </div>
      <div class="key-actions">
        <button class="btn-icon btn-copy" :class="{ copied }" @click="handleCopy" title="复制 Key">
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <button class="btn-icon btn-edit" @click="$emit('edit', item)" title="编辑">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn-icon btn-delete" @click="$emit('requestDelete', item)" title="删除">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
    <div class="key-value-row">
      <code class="key-value" :class="{ 'key-hidden': !showKey }">
        {{ showKey ? item.key : maskKey(item.key) }}
      </code>
      <button class="btn-icon btn-toggle" @click="toggleShowKey" :title="showKey ? '隐藏' : '显示'">
        <svg v-if="!showKey" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      </button>
    </div>
    <div class="key-meta">
      <div v-if="item.note" class="key-note">{{ item.note }}</div>
      <div class="key-timestamps">
        <span>创建于 {{ formatTime(item.createdAt) }}</span>
        <span v-if="item.lastCopiedAt" class="key-last-copied">上次复制 {{ timeAgo(item.lastCopiedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { KeyItem } from '../types'
import { useClipboard } from '../composables/useClipboard'

const props = defineProps<{ item: KeyItem }>()
const emit = defineEmits<{
  edit: [item: KeyItem]
  requestDelete: [item: KeyItem]
  togglePin: [id: string]
  copied: [id: string]
}>()

const { copyToClipboard } = useClipboard()
const showKey = ref(false)
const copied = ref(false)
let autoHideTimer: ReturnType<typeof setTimeout> | null = null

function maskKey(key: string) {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}

function toggleShowKey() {
  showKey.value = !showKey.value
  if (autoHideTimer) clearTimeout(autoHideTimer)
  if (showKey.value) {
    autoHideTimer = setTimeout(() => { showKey.value = false }, 5000)
  }
}

async function handleCopy() {
  await copyToClipboard(props.item.key, props.item.name)
  emit('copied', props.item.id)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

function formatTime(ts: number): string {
  const date = new Date(ts)
  const beijing = new Date(date.getTime() + (8 - (-date.getTimezoneOffset() / 60)) * 3600000)
  const y = beijing.getFullYear()
  const m = String(beijing.getMonth() + 1).padStart(2, '0')
  const d = String(beijing.getDate()).padStart(2, '0')
  const h = String(beijing.getHours()).padStart(2, '0')
  const min = String(beijing.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return '刚刚'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return formatTime(ts)
}
</script>

<style scoped>
.btn-copy.copied {
  color: var(--success) !important;
  background: var(--success-soft) !important;
}
</style>
