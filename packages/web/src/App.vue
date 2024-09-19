<template>
  <router-view :class="[mode]" v-if="!active.webview" />
  <guidance-view v-else />
</template>
<script setup>
import { computed, reactive, onMounted } from 'vue';

import { useSettingStore } from '@/store';
import GuidanceView from '@/pages/guidance/index.vue';

const store = useSettingStore();

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
    return /Feishu|DingTalk|MicroMessenger|Bytedance|NewsArticle|Zhihu|Weibo|AlipayClient|MQQBrowser/gi.test(ua);
  };
  active.webview = isWebview(userAgent);
});
</script>

<style scoped></style>
