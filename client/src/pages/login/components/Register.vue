<template>
  <t-form ref="form" :class="['item-container', 'register-email']" :data="formData" :rules="FORM_RULES"
    label-width="0" @submit="onSubmit">
    <t-form-item name="username">
      <t-input v-model="formData.username" type="text" size="large" placeholder="请输入您的称呼">
        <template #prefix-icon>
          <t-icon name="user" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="email">
      <t-input v-model="formData.email" type="text" size="large" placeholder="请输入您的邮箱">
        <template #prefix-icon>
          <t-icon name="mail" />
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

    <t-form-item class="verification-code" name="verifyCode">
      <t-input v-model="formData.verifyCode" size="large" placeholder="请输入验证码" />
      <t-button variant="outline" :disabled="countDown > 0" @click="sendCode">
        {{ countDown == 0 ? '发送验证码' : `${countDown}秒后可重发` }}
      </t-button>
    </t-form-item>

    <t-form-item class="check-container" name="checked">
      <t-checkbox v-model="formData.checked">我已阅读并同意 </t-checkbox> <span>服务协议</span>
    </t-form-item>

    <t-form-item>
      <t-button block size="large" type="submit"> 注册 </t-button>
    </t-form-item>
  </t-form>
</template>

<script setup lang="js">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';

import { useCounter } from '@/hooks';
import { apiSendMail, apiRegister } from '@/api/user';

const INITIAL_DATA = {
  username: '',
  email: '',
  password: '',
  verifyCode: '',
  checked: false,
};

const FORM_RULES = {
  username: [{ required: true, message: ' 用户名必填', type: 'error' }],
  email: [
    { required: true, message: '邮箱必填', type: 'error' },
    { email: true, message: '请输入正确的邮箱', type: 'warning' },
  ],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  verifyCode: [{ required: true, message: '验证码必填', type: 'error' }],
};

const [countDown, handleCounter] = useCounter();
const form = ref();
const formData = ref({ ...INITIAL_DATA });

const showPsw = ref(false);


const emit = defineEmits(['registerSuccess']);

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
    if (!formData.value.checked) {
      MessagePlugin.error('请同意服务协议');
      return;
    }
    try {
      const response = await apiRegister({ username: formData.value.username, email: formData.value.email, password: formData.value.password, code: formData.value.verifyCode });

      if (response.code === 0) {
        MessagePlugin.success(`注册成功, 前往登录`);
        emit('registerSuccess');
      } else {
        MessagePlugin.error(response.msg);
      };
    } catch (e) {
      console.log(e);
      MessagePlugin.error(e.message);
    }
  }
};

const switchType = (val) => {
  form.value.reset();
  type.value = val;
};
</script>

<style lang="less" scoped>
@import '../index.less';
</style>