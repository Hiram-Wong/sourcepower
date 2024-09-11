<template>
  <router-view :class="[mode]" />
</template>
<script setup>
import { computed } from 'vue';

import { useSettingStore } from '@/store';

const store = useSettingStore();

const mode = computed(() => {
  return store.displayMode;
});
</script>

<style scoped></style>
