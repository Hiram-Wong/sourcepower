<template>
  <div class="login view-container">
    <div class="login-container">
      <div class="title">
        <h4 v-if="active.view === 'login'">使用账号登录到源动力</h4>
        <h4 v-else-if="active.view === 'register'">注册源动力账号</h4>
      </div>
      <div class="content">
        <login v-if="active.view === 'login'" @change="switchType('register')" />
        <register v-else-if="active.view === 'register'" @change="switchType('login')" />
        <div class="agreement">
          <t-divider style="margin: var(--td-comp-margin-s) 0" />
          <p>
            <span>
              登录/注册代表你已同意
              <t-link theme="primary" @click="handleDialog('statement')">用户协议</t-link>
              和
              <t-link theme="primary" @click="handleDialog('privacy')">隐私政策</t-link>
            </span>
          </p>
        </div>
      </div>
    </div>
    <t-dialog
      v-model:visible="isVisible.dialog"
      :header="active.dialog === 'privacy' ? '隐私政策' : '用户协议'"
      :cancel-btn="null"
      confirm-btn="同意"
      placement="center"
      @confirm="isVisible.dialog = false"
    >
      <render-markdown v-model:markdownText="mdContent" class="dialog-container" />
    </t-dialog>
  </div>
</template>

<script setup lang="js">
import { reactive, ref } from 'vue';

import Login from './components/Login.vue';
import Register from './components/Register.vue';
import RenderMarkdown from '@/components/markdown/index.vue';

import MdPrrivacy from '@/assets/md/privacy.md?raw';
import MdStatement from '@/assets/md/statement.md?raw';

const isVisible = reactive({
  dialog: false,
});
const active = reactive({
  view: 'login',
  dialog: 'privacy',
});
const mdContent = ref(MdPrrivacy);
const switchType = (type) => {
  active.view = type;
};

const handleDialog = (type) => {
  isVisible.dialog = true;
  active.dialog = type;
  mdContent.value = type === 'privacy' ? MdPrrivacy : MdStatement;
};
</script>

<style lang="less" scoped>
.view-container {
  background: var(--td-bg-color-page);
  height: 100vh;
  width: 100vw;

  .login-container {
    background: var(--td-bg-color-container);
    width: 480px;
    transform: translate(-50%, -50%);
    font-weight: 700;
    border-radius: 12px;
    box-shadow: var(--td-shadow-3);
    border: 1px solid var(--td-border-level-2-color);
    top: 50%;
    left: 50%;
    position: absolute;

    .title {
      background-image: -webkit-image-set(url('@/assets/logo/cloud.png') 1x, url('@/assets//logo/cloud@2x.png') 2x);
      background-size: 120px auto;
      background-repeat: no-repeat;
      background-position: center 30px;
      height: 209px;
      padding: 0;
      margin: 0 0 60px 0;
      position: relative;

      h4 {
        height: 29px;
        line-height: 29px;
        font-size: 24px;
        font-weight: 500;
        color: var(--td-text-color-primary);
        border-bottom: none;
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
    }

    .content {
      padding: 0 var(--td-comp-paddingLR-l) var(--td-comp-paddingTB-m);
      position: relative;
      z-index: 9;
      height: auto;
      margin-top: var(--td-comp-margin-xxl);

      .agreement {
        font-size: 13.5px;
        font-weight: 700;

        p {
          height: 24px;
          line-height: 24px;
          color: var(--td-text-color-placeholder);

          span {
            display: block;
            text-align: center;
          }
        }
      }
    }
  }

  @media (max-width: 750px) {
    .login-container {
      width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
      box-shadow: none;
      top: 0;
      left: 0;
      position: relative;
      transform: none;

      .agreement {
        position: fixed;
        left: 0;
        right: 0;
        bottom: var(--td-comp-margin-xxl);
      }
    }
  }
}

.dialog-container {
  .header {
    margin-top: 45px;
    font-weight: 700;
    font-size: 28px;
    text-align: center;
    color: var(--td-text-color-primary);
  }

  max-height: 460px;
  overflow-y: auto;
  display: block;
}

@media (max-width: 750px) {
  :deep(.t-dialog) {
    width: 100%;
  }
}
</style>
