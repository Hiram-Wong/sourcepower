<template>
  <router-view :class="[mode]" />
</template>
<script setup>
import { computed } from 'vue';

import { useSettingStore } from '@/store';

const store = useSettingStore();

const mode = computed(() => {
  const theme = store.displayMode;
  store.changeMode(theme);
  return theme;
});
</script>

<style scoped></style>
