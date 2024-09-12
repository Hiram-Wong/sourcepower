<template>
  <t-form ref="form" :class="['item-container', `login-password`]" :data="formData" :rules="FORM_RULES" label-width="0"
    @submit="onSubmit">
    <t-form-item name="email">
      <t-input v-model="formData.email" size="large" placeholder="请输入登录邮箱">
        <template #prefix-icon>
          <t-icon name="user" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="password">
      <t-input v-model="formData.password" size="large" :type="showPsw ? 'text' : 'password'" clearable
        placeholder="请输入登录密码">
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
        <template #suffix-icon>
          <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item class="verification-code" name="verifyCode" v-if="type === 'retrieve'">
      <t-input v-model="formData.verifyCode" size="large" placeholder="请输入验证码" />
      <t-button variant="outline" :disabled="countDown > 0" @click="sendCode">
        {{ countDown == 0 ? '发送验证码' : `${countDown}秒后可重发` }}
      </t-button>
    </t-form-item>

    <div class="check-container remember-pwd">
      <div></div>
      <span class="tip" @click="type = 'login'" v-if="type === 'retrieve'">前往登录</span>
      <span class="tip" @click="type = 'retrieve'" v-else>忘记密码</span>
    </div>

    <t-button block size="large" type="submit">{{ type === 'login' ? '登录' : '找回' }}</t-button>
  </t-form>
</template>

<script setup lang="js">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { apiForgetPassword, apiSendMail } from '@/api/user';
import { useUserStore } from '@/store';
import { useCounter } from '@/hooks';

const [countDown, handleCounter] = useCounter();
const userStore = useUserStore();

const INITIAL_DATA = {
  email: '',
  password: '',
  verifyCode: '',
};

const FORM_RULES = {
  email: [
    { required: true, message: '邮箱必填', type: 'error' },
    { email: true, message: '请输入正确的邮箱', type: 'warning' },
  ],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  verifyCode: [{ required: true, message: '验证码必填', type: 'error' }],
};

const type = ref('login');
const form = ref();
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);

const router = useRouter();
const route = useRoute();

const sendCode = async () => {
  const { email } = formData.value;

  if (!email) {
    MessagePlugin.info('请先输入邮箱地址');
    return;
  };

  const response = await apiSendMail({ email });

  if (response.code === 0) {
    MessagePlugin.success('验证码发送成功, 有效期5分钟!');
    handleCounter();
  } else {
    MessagePlugin.error(response.msg);
  };
};

const onSubmit = async (ctx) => {
  if (ctx.validateResult === true) {
    try {
      if (type.value === 'login') {
        await userStore.login({ email: formData.value.email, password: formData.value.password });

        MessagePlugin.success('登录成功');

        const redirect = route.query.redirect;

        if (userStore.userInfo.roles.includes('admin')) {
          const redirectUrl = redirect ? decodeURIComponent(redirect) : '/admin';
          router.push(redirectUrl);
        } else {
          const redirectUrl = redirect ? decodeURIComponent(redirect) : '/';
          router.push(redirectUrl);
        }

      } else if (type.value === 'retrieve') {
        const response = await apiForgetPassword({ email: formData.value.email, code: formData.value.verifyCode, password: formData.value.password });

        if (response.code === 0) {
          MessagePlugin.success('恭喜找回密码, 前往登录!');

          type.value = 'login';
        } else {
          MessagePlugin.error(response.msg);
        };
      }
    } catch (e) {
      console.log(e);
      MessagePlugin.error(e.message);
    }
  }
};
</script>

<style lang="less" scoped>
@import '../index.less';
</style>