import { ref, computed, watch } from 'vue'
import type { KeyItem } from '../types'

const STORAGE_KEY = 'keyvault_keys'

function loadKeys(): KeyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const keys = ref<KeyItem[]>(loadKeys())

function saveKeys() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys.value))
}

watch(keys, saveKeys, { deep: true })

export function useKeys() {
  const searchQuery = ref('')
  const activeGroup = ref('全部')

  const groups = computed(() => {
    const set = new Set(keys.value.map(k => k.group))
    return ['全部', ...Array.from(set).sort()]
  })

  const filteredKeys = computed(() => {
    let result = keys.value

    if (activeGroup.value !== '全部') {
      result = result.filter(k => k.group === activeGroup.value)
    }

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      result = result.filter(k =>
        k.name.toLowerCase().includes(q) ||
        k.group.toLowerCase().includes(q) ||
        (k.note && k.note.toLowerCase().includes(q))
      )
    }

    // Pinned first, then by createdAt desc
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.createdAt - a.createdAt
    })
  })

  function addKey(item: Omit<KeyItem, 'id' | 'createdAt'>) {
    keys.value.push({
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    })
  }

  function updateKey(id: string, updates: Partial<Omit<KeyItem, 'id' | 'createdAt'>>) {
    const item = keys.value.find(k => k.id === id)
    if (item) {
      Object.assign(item, updates)
    }
  }

  function deleteKey(id: string) {
    keys.value = keys.value.filter(k => k.id !== id)
  }

  function togglePin(id: string) {
    const item = keys.value.find(k => k.id === id)
    if (item) {
      item.pinned = !item.pinned
    }
  }

  function recordCopy(id: string) {
    const item = keys.value.find(k => k.id === id)
    if (item) {
      item.lastCopiedAt = Date.now()
    }
  }

  function exportKeys(): string {
    return JSON.stringify(keys.value, null, 2)
  }

  function importKeys(
    json: string,
    mode: 'skip' | 'overwrite' | 'append' = 'append'
  ): { success: boolean; count: number; skipped: number; error?: string } {
    try {
      const data = JSON.parse(json)
      if (!Array.isArray(data)) {
        return { success: false, count: 0, skipped: 0, error: '无效的数据格式' }
      }
      let count = 0
      let skipped = 0
      for (const item of data) {
        if (!item.name || !item.key) continue

        const existingIndex = keys.value.findIndex(k => k.name === item.name)

        if (existingIndex !== -1) {
          if (mode === 'skip') {
            skipped++
            continue
          }
          if (mode === 'overwrite') {
            const existing = keys.value[existingIndex]!
            existing.key = item.key
            existing.group = item.group || existing.group
            existing.note = item.note ?? existing.note
            count++
            continue
          }
          // mode === 'append': fall through to push
        }

        keys.value.push({
          id: item.id || crypto.randomUUID(),
          name: item.name,
          key: item.key,
          group: item.group || '未分组',
          note: item.note || '',
          pinned: item.pinned || false,
          createdAt: item.createdAt || Date.now(),
          lastCopiedAt: item.lastCopiedAt,
        })
        count++
      }
      return { success: true, count, skipped }
    } catch {
      return { success: false, count: 0, skipped: 0, error: 'JSON 解析失败' }
    }
  }

  function checkDuplicates(json: string): { total: number; duplicates: number } {
    try {
      const data = JSON.parse(json)
      if (!Array.isArray(data)) return { total: 0, duplicates: 0 }
      const valid = data.filter((item: any) => item.name && item.key)
      const duplicates = valid.filter((item: any) =>
        keys.value.some(k => k.name === item.name)
      ).length
      return { total: valid.length, duplicates }
    } catch {
      return { total: 0, duplicates: 0 }
    }
  }

  function replaceAllKeys(newKeys: KeyItem[]) {
    keys.value = newKeys
  }

  return {
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
  }
}
