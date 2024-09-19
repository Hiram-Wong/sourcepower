<template>
  <t-form
    ref="form"
    :class="['item-container', 'register-email']"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <t-form-item name="username">
      <t-input v-model="formData.username" type="text" size="large" placeholder="用户名" class="input-item" />
    </t-form-item>

    <t-form-item name="email">
      <t-input v-model="formData.email" type="text" size="large" placeholder="邮箱" class="input-item" />
    </t-form-item>

    <t-form-item name="password">
      <t-input
        v-model="formData.password"
        size="large"
        :type="showPsw ? 'text' : 'password'"
        clearable
        placeholder="登录密码"
        class="input-item"
      >
        <template #suffix-icon>
          <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="verifyCode">
      <div class="verification-code">
        <t-input v-model="formData.verifyCode" size="large" placeholder="邮箱验证码" class="input-item" />
        <t-button variant="outline" :disabled="countDown > 0" @click="sendCode" class="sendcode">
          {{ countDown == 0 ? '发送验证码' : `${countDown}秒后可重发` }}
        </t-button>
      </div>
    </t-form-item>

    <t-form-item name="checked">
      <div class="check-container">
        <div class="left">
          <t-checkbox v-model="formData.checked">我已阅读并同意遵守底部服务协议</t-checkbox>
        </div>
        <div class="right">
          <span class="gotologin tip" @click="handleLogin">前往登录</span>
        </div>
      </div>
    </t-form-item>

    <t-form-item>
      <t-button block size="large" type="submit" class="submit"> 注册 </t-button>
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
    { email: true, message: '邮箱不正确', type: 'error' },
  ],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  verifyCode: [{ required: true, message: '验证码必填', type: 'error' }],
};

const [countDown, handleCounter] = useCounter();
const form = ref();
const formData = ref({ ...INITIAL_DATA });

const showPsw = ref(false);

const emits = defineEmits(['change']);

const sendCode = async () => {
  const { email } = formData.value;

  if (!email) {
    MessagePlugin.info('请先输入邮箱地址');
    return;
  }

  const response = await apiSendMail({ email });

  if (response.code === 0) {
    MessagePlugin.success('验证码发送成功, 有效期5分钟!');
    handleCounter();
  } else {
    MessagePlugin.error(response.msg);
  }
};

const onSubmit = async (ctx) => {
  if (ctx.validateResult === true) {
    if (!formData.value.checked) {
      MessagePlugin.info('请阅读并同意遵守协议');
      return;
    }
    try {
      const response = await apiRegister({
        username: formData.value.username,
        email: formData.value.email,
        password: formData.value.password,
        code: formData.value.verifyCode,
      });

      if (response.code === 0) {
        MessagePlugin.success(`注册成功, 前往登录`);
        emits('change', 'login');
      } else {
        MessagePlugin.error(response.msg);
      }
    } catch (e) {
      console.log(e);
      MessagePlugin.error(e.message);
    }
  }
};

const handleLogin = () => {
  emits('change', 'login');
};
</script>

<style lang="less" scoped>
.input-item {
  :deep(.t-input) {
    border-radius: var(--td-radius-medium);
  }
}

.submit {
  border-radius: var(--td-radius-medium);
  margin: var(--td-comp-margin-m) 0;
  overflow: hidden;
}

.verification-code {
  width: 100%;
  display: flex;
  .sendcode {
    margin-left: var(--td-comp-margin-s);
    height: var(--td-comp-size-xl);
    border-radius: var(--td-radius-medium);
  }
}

:deep(.t-input__extra) {
  max-width: 300px;
  display: inline;
  height: 30px;
  line-height: 30px;
  margin: 4px 0 0;
  padding: 0 12px;
  right: 7px;
  font-weight: 700;
  font-size: 13.5px;
  background: linear-gradient(0deg, #e65c53, #e65c53);
  box-shadow: var(--td-shadow-3);
  border-radius: 6px;
  top: 0;
  width: fit-content;
  color: var(--td-text-color-primary);
  z-index: 2;
}

.check-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .right,
  .left {
    display: flex;
    align-items: center;
  }

  .tip {
    cursor: pointer;
    color: var(--td-brand-color);
  }
}

:deep(.t-form__item) {
  margin-bottom: var(--td-comp-margin-m);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
