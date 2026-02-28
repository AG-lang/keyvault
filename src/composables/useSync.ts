import { ref, computed } from 'vue'
import type { KeyItem } from '../types'

const SYNC_CONFIG_KEY = 'keyvault_sync_config'
const GIST_FILENAME = 'keyvault-data.json'

interface SyncConfig {
  token: string
  gistId: string
}

function loadConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const syncConfig = ref<SyncConfig | null>(loadConfig())
const syncing = ref(false)
const lastSyncTime = ref<number | null>(null)

export function useSync() {
  const isConfigured = computed(() => !!syncConfig.value?.token && !!syncConfig.value?.gistId)

  function saveConfig(config: SyncConfig) {
    syncConfig.value = config
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config))
  }

  function clearConfig() {
    syncConfig.value = null
    localStorage.removeItem(SYNC_CONFIG_KEY)
  }

  async function createGist(token: string, keys: KeyItem[]): Promise<string> {
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'KeyVault 密钥数据（自动同步）',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(keys, null, 2),
          },
        },
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `创建 Gist 失败 (${res.status})`)
    }
    const data = await res.json()
    return data.id
  }

  async function uploadToGist(keys: KeyItem[]): Promise<void> {
    if (!syncConfig.value) throw new Error('未配置同步')
    syncing.value = true
    try {
      const { token, gistId } = syncConfig.value
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(keys, null, 2),
            },
          },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `上传失败 (${res.status})`)
      }
      lastSyncTime.value = Date.now()
    } finally {
      syncing.value = false
    }
  }

  async function downloadFromGist(): Promise<KeyItem[]> {
    if (!syncConfig.value) throw new Error('未配置同步')
    syncing.value = true
    try {
      const { token, gistId } = syncConfig.value
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `下载失败 (${res.status})`)
      }
      const data = await res.json()
      const file = data.files?.[GIST_FILENAME]
      if (!file) throw new Error('Gist 中未找到数据文件')
      const keys = JSON.parse(file.content)
      if (!Array.isArray(keys)) throw new Error('数据格式无效')
      lastSyncTime.value = Date.now()
      return keys
    } finally {
      syncing.value = false
    }
  }

  async function validateToken(token: string): Promise<boolean> {
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      return res.ok
    } catch {
      return false
    }
  }

  return {
    syncConfig,
    syncing,
    lastSyncTime,
    isConfigured,
    saveConfig,
    clearConfig,
    createGist,
    uploadToGist,
    downloadFromGist,
    validateToken,
  }
}
