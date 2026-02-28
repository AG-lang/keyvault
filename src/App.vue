<template>
  <div class="app">
    <header class="app-header">
      <h1>KeyVault</h1>
      <p class="subtitle">API 密钥管理</p>
    </header>

    <div class="toolbar">
      <div class="search-bar">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索密钥..."
          class="search-input"
        />
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-sync" :class="{ connected: isConfigured }" @click="showSyncDialog = true" title="云端同步">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
        </button>
        <ImportExport @export="handleExport" @import="handleImportFile" />
        <button class="btn btn-primary" @click="openAddForm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          添加密钥
        </button>
      </div>
    </div>

    <GroupTabs
      :groups="groups"
      :active-group="activeGroup"
      :keys="keys"
      @select="activeGroup = $event"
    />

    <TransitionGroup name="list" tag="div" class="key-list" v-if="filteredKeys.length > 0">
      <KeyCard
        v-for="item in filteredKeys"
        :key="item.id"
        :item="item"
        @edit="openEditForm"
        @request-delete="openDeleteConfirm"
        @toggle-pin="togglePin"
        @copied="recordCopy"
      />
    </TransitionGroup>
    <div class="empty-state" v-else>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <p v-if="searchQuery">没有找到匹配的密钥</p>
      <p v-else>还没有密钥，点击「添加密钥」开始</p>
    </div>

    <KeyForm
      v-if="showForm"
      :edit-item="editingItem"
      :existing-groups="existingGroupNames"
      @close="closeForm"
      @submit="handleFormSubmit"
    />

    <ConfirmDialog
      v-if="deleteTarget"
      type="danger"
      title="删除密钥"
      :message="`确定删除「${deleteTarget.name}」吗？此操作不可撤销。`"
      confirm-text="删除"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <ImportDialog
      v-if="importPending"
      :total="importInfo.total"
      :duplicates="importInfo.duplicates"
      @select="handleImportMode"
      @cancel="cancelImport"
    />

    <SyncDialog
      v-if="showSyncDialog"
      :keys="keys"
      @close="showSyncDialog = false"
      @upload="handleSyncUpload"
      @download="handleSyncDownload"
    />

    <Transition name="toast">
      <div v-if="toastVisible" class="toast">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { KeyItem } from './types'
import { useKeys } from './composables/useKeys'
import { useClipboard } from './composables/useClipboard'
import { useSync } from './composables/useSync'
import KeyCard from './components/KeyCard.vue'
import KeyForm from './components/KeyForm.vue'
import GroupTabs from './components/GroupTabs.vue'
import ImportExport from './components/ImportExport.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import SyncDialog from './components/SyncDialog.vue'

const {
  keys,
  searchQuery,
  activeGroup,
  groups,
  filteredKeys,
  addKey,
  updateKey,
  deleteKey,
  togglePin,
  recordCopy,
  exportKeys,
  importKeys,
  checkDuplicates,
  replaceAllKeys,
} = useKeys()

const { toastMessage, toastVisible, showToast } = useClipboard()
const { isConfigured, uploadToGist, downloadFromGist } = useSync()

const showForm = ref(false)
const editingItem = ref<KeyItem | null>(null)
const deleteTarget = ref<KeyItem | null>(null)
const showSyncDialog = ref(false)

// Import state
const importPending = ref(false)
const importJson = ref('')
const importInfo = ref({ total: 0, duplicates: 0 })

const existingGroupNames = computed(() =>
  groups.value.filter(g => g !== '全部')
)

function openAddForm() {
  editingItem.value = null
  showForm.value = true
}

function openEditForm(item: KeyItem) {
  editingItem.value = item
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingItem.value = null
}

function handleFormSubmit(data: { name: string; key: string; group: string; note: string }) {
  if (editingItem.value) {
    updateKey(editingItem.value.id, data)
  } else {
    addKey(data)
  }
  closeForm()
}

// Delete
function openDeleteConfirm(item: KeyItem) {
  deleteTarget.value = item
}

function confirmDelete() {
  if (deleteTarget.value) {
    deleteKey(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

// Export
function handleExport() {
  const json = exportKeys()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `keyvault-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Import
function handleImportFile(json: string) {
  const info = checkDuplicates(json)
  if (info.total === 0) {
    alert('文件中没有有效的密钥数据')
    return
  }
  if (info.duplicates > 0) {
    importJson.value = json
    importInfo.value = info
    importPending.value = true
  } else {
    const result = importKeys(json, 'append')
    if (result.success) {
      alert(`成功导入 ${result.count} 条密钥`)
    }
  }
}

function handleImportMode(mode: 'skip' | 'overwrite' | 'append') {
  const result = importKeys(importJson.value, mode)
  importPending.value = false
  importJson.value = ''
  if (result.success) {
    let msg = `成功导入 ${result.count} 条密钥`
    if (result.skipped > 0) msg += `，跳过 ${result.skipped} 条重复`
    alert(msg)
  }
}

function cancelImport() {
  importPending.value = false
  importJson.value = ''
}

// Sync
async function handleSyncUpload() {
  try {
    await uploadToGist(keys.value)
    showToast(`已上传 ${keys.value.length} 条密钥到云端`)
  } catch (e: any) {
    alert(`上传失败: ${e.message}`)
  }
}

async function handleSyncDownload() {
  try {
    const remoteKeys = await downloadFromGist()
    replaceAllKeys(remoteKeys)
    showToast(`已从云端下载 ${remoteKeys.length} 条密钥`)
    showSyncDialog.value = false
  } catch (e: any) {
    alert(`下载失败: ${e.message}`)
  }
}
</script>
