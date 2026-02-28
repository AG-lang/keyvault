<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('cancel')">
      <div class="confirm-dialog">
        <div class="confirm-icon info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h3>导入密钥</h3>
        <p>共 {{ total }} 条密钥，其中 <strong>{{ duplicates }} 条</strong>与现有密钥同名。</p>
        <div class="import-actions">
          <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
          <button class="btn btn-secondary" @click="$emit('select', 'skip')">跳过重复</button>
          <button class="btn btn-secondary" @click="$emit('select', 'overwrite')">覆盖重复</button>
          <button class="btn btn-primary" @click="$emit('select', 'append')">全部追加</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  total: number
  duplicates: number
}>()

defineEmits<{
  cancel: []
  select: [mode: 'skip' | 'overwrite' | 'append']
}>()
</script>
