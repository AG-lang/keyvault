<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>云端同步设置</h2>

      <template v-if="!isConfigured">
        <p class="sync-desc">通过 GitHub Gist 同步数据，实现多设备共享。</p>

        <div class="form-group">
          <label for="sync-token">GitHub Token *</label>
          <input
            id="sync-token"
            v-model="token"
            type="password"
            placeholder="ghp_xxxx..."
            autocomplete="off"
          />
          <span class="form-hint">需要 gist 权限，<a href="https://github.com/settings/tokens/new?scopes=gist&description=KeyVault" target="_blank">点此生成</a></span>
        </div>

        <div class="form-group">
          <label>Gist ID</label>
          <div class="gist-options">
            <label class="radio-label">
              <input type="radio" v-model="gistMode" value="new" />
              <span>自动创建新 Gist</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="gistMode" value="existing" />
              <span>使用已有 Gist ID</span>
            </label>
          </div>
          <input
            v-if="gistMode === 'existing'"
            v-model="gistId"
            type="text"
            placeholder="粘贴 Gist ID..."
            autocomplete="off"
          />
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="$emit('close')">取消</button>
          <button class="btn btn-primary" @click="handleSave" :disabled="saving">
            {{ saving ? '验证中...' : '保存' }}
          </button>
        </div>

        <p v-if="error" class="sync-error">{{ error }}</p>
      </template>

      <template v-else>
        <div class="sync-status">
          <div class="sync-info-row">
            <span class="sync-label">状态</span>
            <span class="sync-connected">已连接</span>
          </div>
          <div class="sync-info-row">
            <span class="sync-label">Gist ID</span>
            <code class="sync-gist-id">{{ config!.gistId }}</code>
          </div>
        </div>

        <div class="sync-actions">
          <button class="btn btn-primary sync-btn" @click="$emit('upload')" :disabled="syncing">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            {{ syncing ? '同步中...' : '上传到云端' }}
          </button>
          <button class="btn btn-secondary sync-btn" @click="$emit('download')" :disabled="syncing">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            从云端下载
          </button>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary btn-sm" @click="handleDisconnect">断开连接</button>
          <button class="btn btn-secondary" @click="$emit('close')">关闭</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { KeyItem } from '../types'
import { useSync } from '../composables/useSync'

const props = defineProps<{
  keys: KeyItem[]
}>()

const emit = defineEmits<{
  close: []
  upload: []
  download: []
}>()

const { syncConfig: config, syncing, isConfigured, saveConfig, clearConfig, createGist, validateToken } = useSync()

const token = ref('')
const gistId = ref('')
const gistMode = ref<'new' | 'existing'>('new')
const saving = ref(false)
const error = ref('')

async function handleSave() {
  error.value = ''
  const t = token.value.trim()
  if (!t) {
    error.value = '请输入 GitHub Token'
    return
  }

  saving.value = true
  try {
    const valid = await validateToken(t)
    if (!valid) {
      error.value = 'Token 无效或已过期'
      return
    }

    let id = gistId.value.trim()
    if (gistMode.value === 'new') {
      id = await createGist(t, props.keys)
    }

    if (!id) {
      error.value = '请输入 Gist ID'
      return
    }

    saveConfig({ token: t, gistId: id })
  } catch (e: any) {
    error.value = e.message || '保存失败'
  } finally {
    saving.value = false
  }
}

function handleDisconnect() {
  clearConfig()
}
</script>
