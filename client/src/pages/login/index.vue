<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="title-container">
        <h1 class="title margin-no">登录到</h1>
        <h1 class="title">'源'动力</h1>
        <div class="sub-title">
          <p class="tip">{{ type == 'register' ? '已有账号吗?' : '没有账号吗?' }}</p>
          <p class="tip" @click="switchType(type == 'register' ? 'login' : 'register')">
            {{ type == 'register' ? '登录' : '注册新账号' }}
          </p>
        </div>
      </div>

      <login v-if="type === 'login'" />
      <register v-else @register-success="switchType('login')" />
    </div>

    <footer class="copyright">Copyright © 2024 源动力</footer>
  </div>
</template>
<script lang="js">
export default {
  name: 'LoginIndex',
};
</script>
<script setup lang="js">
import { ref } from 'vue';

import Login from './components/Login.vue';
import Register from './components/Register.vue';

const type = ref('login');
const switchType = (val) => {
  type.value = val;
};
</script>

<style lang="less" scoped>
@import './index.less';
</style>