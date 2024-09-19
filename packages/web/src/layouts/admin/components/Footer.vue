<template>
  <div :class="prefix + '-footer'">Copyright © {{ new Date().getFullYear() }} 源动力, All Rights Reserved.</div>
</template>

<script setup lang="js">
import { prefix } from '@/config/global';
</script>

<style lang="less" scoped>
.sp-footer {
  color: var(--td-text-color-placeholder);
  line-height: 20px;
  text-align: center;
}
</style>
