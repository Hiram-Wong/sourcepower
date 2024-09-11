<template>
  <t-layout class="t-layout">
    <t-header class="t-header">
      <layout-header />
    </t-header>
    <t-content class="t-content">
      <layout-content />
    </t-content>
  </t-layout>
</template>


<script setup lang="js">
import '@/style/home.less';

import LayoutContent from './components/Content.vue';
import LayoutHeader from './components/Header.vue';
</script>

<style lang="less" scoped>
.t-layout {
  background-color: var(--td-bg-color-secondarycontainer);
  min-height: 100vh;
}

.t-header {
  height: var(--td-comp-size-xxxl);
  position: relative;
  z-index: 99;
  -webkit-box-shadow: 0 2px 16px rgba(54, 56, 79, .06);
  box-shadow: 0 2px 16px rgba(54, 56, 79, .06);
}

.t-content {
  position: relative;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - var(--td-comp-size-xxxl));
  overflow: auto;
}
</style>
