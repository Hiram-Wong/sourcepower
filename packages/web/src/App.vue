<template>
  <router-view :class="[mode]" v-if="!active.webview" />
  <guidance-view v-else />
</template>
<script setup>
import { computed, reactive, onMounted, onUnmounted } from 'vue';

import { useSettingStore } from '@/store';
import GuidanceView from '@/pages/guidance/index.vue';

const store = useSettingStore();

const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)');
const themeWatcher = (e) => {
  store.changeMode(e.matches ? 'dark' : 'light');
};
mediaQuery.addEventListener('change', themeWatcher);

const mode = computed(() => {
  const theme = store.displayMode;
  store.changeMode(theme);
  return theme;
});

const active = reactive({
  webview: false,
});

onMounted(() => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isWebview = (ua) => {
    return /MicroMessenger|wxwork|QQTheme/gi.test(ua);
  };

  active.webview = isWebview(userAgent);
});

onUnmounted(() => {
  mediaQuery.removeEventListener('change', updateTheme);
});
</script>

<style scoped></style>
