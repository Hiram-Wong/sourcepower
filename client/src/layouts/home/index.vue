<template>
  <t-layout>
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
.t-header {
  height: var(--td-comp-size-xxxl);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  position: fixed;
  top: 0px;
  left: auto;
  right: 0px;
  background-color: transparent;
  transition: background-color 0.2s;
  box-shadow: none;
  z-index: 100;
  backdrop-filter: blur(10px);
}
</style>
