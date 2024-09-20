<template>
  <div class="captcha"></div>
</template>

<script lang="js" setup>
const props = defineProps({
  captchaConfig: Object,
});

if (props.captchaConfig) {
  window.initGeetest4(prop.captchaConfig.config, prop.captchaConfig.handler);
}
</script>
