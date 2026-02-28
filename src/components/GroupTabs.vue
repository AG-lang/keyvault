<template>
  <div class="group-tabs">
    <button
      v-for="group in groups"
      :key="group"
      class="group-tab"
      :class="{ active: group === activeGroup }"
      @click="$emit('select', group)"
    >
      {{ group }}
      <span v-if="group !== '全部'" class="group-count">{{ getCount(group) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { KeyItem } from '../types'

const props = defineProps<{
  groups: string[]
  activeGroup: string
  keys: KeyItem[]
}>()

defineEmits<{ select: [group: string] }>()

function getCount(group: string) {
  return props.keys.filter(k => k.group === group).length
}
</script>
