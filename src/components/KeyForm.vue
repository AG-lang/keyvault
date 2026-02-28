<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ isEdit ? '编辑密钥' : '添加密钥' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">名称 *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="如: OpenRouter"
            required
            autocomplete="off"
          />
        </div>
        <div class="form-group">
          <label for="key">Key *</label>
          <input
            id="key"
            v-model="form.key"
            type="text"
            placeholder="sk-..."
            required
            autocomplete="off"
          />
        </div>
        <div class="form-group">
          <label for="group">分组</label>
          <div class="group-input-wrapper">
            <input
              id="group"
              v-model="form.group"
              type="text"
              placeholder="如: AI"
              list="group-list"
              autocomplete="off"
            />
            <datalist id="group-list">
              <option v-for="g in existingGroups" :key="g" :value="g" />
            </datalist>
          </div>
        </div>
        <div class="form-group">
          <label for="note">备注</label>
          <input
            id="note"
            v-model="form.note"
            type="text"
            placeholder="可选备注信息"
            autocomplete="off"
          />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">取消</button>
          <button type="submit" class="btn btn-primary">{{ isEdit ? '保存' : '添加' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { KeyItem } from '../types'

const props = defineProps<{
  editItem?: KeyItem | null
  existingGroups: string[]
}>()

const emit = defineEmits<{
  close: []
  submit: [data: { name: string; key: string; group: string; note: string }]
}>()

const isEdit = computed(() => !!props.editItem)

const form = reactive({
  name: props.editItem?.name || '',
  key: props.editItem?.key || '',
  group: props.editItem?.group || '',
  note: props.editItem?.note || '',
})

function handleSubmit() {
  emit('submit', {
    name: form.name.trim(),
    key: form.key.trim(),
    group: form.group.trim() || '未分组',
    note: form.note.trim(),
  })
}
</script>
