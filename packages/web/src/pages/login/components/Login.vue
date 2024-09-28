<template>
  <t-form
    ref="form"
    :class="['item-container', `login-password`]"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <t-form-item name="email">
      <t-input v-model="formData.email" size="large" placeholder="邮箱" class="input-item" />
    </t-form-item>

    <t-form-item name="password">
      <t-input
        v-model="formData.password"
        size="large"
        :type="showPsw ? 'text' : 'password'"
        clearable
        placeholder="密码"
        class="input-item"
      >
        <template #suffix-icon>
          <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="verifyCode" v-if="type === 'retrieve'">
      <div class="verification-code">
        <t-input v-model="formData.verifyCode" size="large" placeholder="邮箱验证码" class="input-item" />
        <t-button variant="outline" :disabled="countDown > 0" @click="sendCode" class="sendcode">
          {{ countDown == 0 ? '发送验证码' : `${countDown}秒后可重发` }}
        </t-button>
      </div>
    </t-form-item>

    <t-form-item name="checked">
      <div class="check-container remember-pwd">
        <div class="left">
          <t-checkbox v-model="formData.checked" v-if="type === 'login'">记住账号密码</t-checkbox>
        </div>
        <div class="right">
          <span class="registercloud tip" @click="handleRegister">注册新账号</span>
          <span class="gotologin tip" @click="type = 'login'" v-if="type === 'retrieve'">前往登录</span>
          <span class="forgotpassword tip" @click="type = 'retrieve'" v-else>忘记密码?</span>
        </div>
      </div>
    </t-form-item>
    <t-button block size="large" type="submit" class="submit">{{ type === 'login' ? '登录' : '找回' }}</t-button>
  </t-form>
</template>

<script setup lang="js">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { apiForgetPassword, apiSendMail } from '@/api/user';
import { base64 } from '@/utils/crypto';
import { useUserStore } from '@/store';
import { useCounter } from '@/hooks';

const [countDown, handleCounter] = useCounter();
const userStore = useUserStore();

const INITIAL_DATA = {
  email: '',
  password: '',
  verifyCode: '',
  checked: false,
};

const FORM_RULES = {
  email: [
    { required: true, message: '邮箱必填', type: 'error' },
    { email: true, message: '邮箱不正确', type: 'error' },
  ],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  verifyCode: [{ required: true, message: '验证码必填', type: 'error' }],
};

const emits = defineEmits(['change']);

const type = ref('login');
const form = ref();
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);

const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (userStore.remember.checked) {
    formData.value.email = userStore.remember.email;
    formData.value.password = base64.decode(userStore.remember.password);
    formData.value.checked = userStore.remember.checked;
  }
});

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
    try {
      if (type.value === 'login') {
        await userStore.login({ email: formData.value.email, password: formData.value.password });

        userStore.remember = {
          email: formData.value.checked ? formData.value.email : null,
          password: formData.value.checked ? base64.encode(formData.value.password) : null,
          checked: formData.value.checked,
        };

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
        const response = await apiForgetPassword({
          email: formData.value.email,
          code: formData.value.verifyCode,
          password: formData.value.password,
        });

        if (response.code === 0) {
          MessagePlugin.success('恭喜找回密码, 前往登录!');

          type.value = 'login';
        } else {
          MessagePlugin.error(response.msg);
        }
      }
    } catch (e) {
      console.log(e);
      MessagePlugin.error(e.message);
    }
  }
};

const handleRegister = () => {
  emits('change', 'register');
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

:deep(.t-form__item) {
  margin-bottom: var(--td-comp-margin-m);

  &:last-child {
    margin-bottom: 0;
  }
}

.check-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .tip {
    cursor: pointer;
    color: var(--td-brand-color);
  }

  .right,
  .left {
    display: flex;
    align-items: center;
  }

  .right {
    .registercloud {
      margin-right: var(--td-comp-margin-s);
      &:after {
        content: '';
        display: inline-block;
        width: 1px;
        height: 11px;
        background-color: var(--td-text-color-disabled);
        margin-left: 9px;
        margin-top: -2px;
        vertical-align: middle;
      }
    }
  }
}
</style>
