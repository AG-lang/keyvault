<template>
  <div class="import-export">
    <button class="btn btn-secondary" @click="handleExport" title="导出密钥">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      导出
    </button>
    <label class="btn btn-secondary import-btn" title="导入密钥">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      导入
      <input type="file" accept=".json" @change="handleImport" hidden />
    </label>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  export: []
  import: [json: string]
}>()

function handleExport() {
  emit('export')
}

function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    emit('import', reader.result as string)
  }
  reader.readAsText(file)
  input.value = ''
}
</script>
