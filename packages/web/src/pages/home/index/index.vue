<template>
  <div class="home view-container">
    <div class="content">
      <t-card title="可持续源" :bordered="false" class="card-item t-card-tag">
        <div class="soico"></div>
        <p class="tip">订阅一下 · 即刻观看</p>
        <div class="search-box">
          <t-input-adornment>
            <template #prepend>
              <t-select v-model="subscribeForm.type" style="width: 70px">
                <t-option label="全部" value="all" />
                <t-option label="敏感" value="sensitive" />
                <t-option label="常规" value="nosensitive" />
              </t-select>
            </template>
            <t-input v-model="subscribeForm.allow_ips" placeholder="请输入授权地址逗号分隔" class="search-input" />
          </t-input-adornment>
          <t-button class="search-button" @click="getCode"> 订阅 </t-button>
        </div>
      </t-card>

      <t-card title="注意事项" :bordered="false" class="card-item t-card-tag">
        <t-collapse class="collapse">
          <t-collapse-panel destroy-on-collapse header="授权地址">
            <p>1.当前请求地址: {{ subscribeForm.ip ? subscribeForm.ip : '未知' }}</p>
            <p>2.服务器没有ipv6地址, 故不支持ipv6授权</p>
            <p>3.最多授权5个ip, 多ip使用半角逗号分隔</p>
            <p>4.重新授权ip只需重新提交即可</p>
          </t-collapse-panel>
          <t-collapse-panel header="使用方法">
            <p>1.使用邮箱注册账户[有账号则跳过]</p>
            <p>2.登录账户</p>
            <p>3.选择数据类型, 并输入授权的ip地址点击'订阅'</p>
            <p>4.在弹窗中获取订阅码链接</p>
          </t-collapse-panel>
          <t-collapse-panel header="白嫖原则">
            <p>1.仅供学习, 勿用于商业及引流</p>
            <p>2.请勿使用服务器爬虫[小黑子勿扰]</p>
            <p>3.每次请求均可溯源, 网络非法外之地</p>
            <p>4.切勿使用临时邮箱注册, 一经发现即删除账户</p>
          </t-collapse-panel>
        </t-collapse>
      </t-card>
    </div>

    <t-dialog v-model:visible="isVisible.sub" header="订阅信息" @confirm="onClickConfirm">
      <div class="sub">
        <p>
          <face-retouching-icon /><span>订阅码: {{ subscribeForm.code }}</span>
        </p>
        <p><link-icon /><span>订阅: </span></p>

        <t-link :href="subscribeForm.url" target="_blank">
          {{ subscribeForm.url }}
        </t-link>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import useClipboard from 'vue-clipboard3';
import { MessagePlugin } from 'tdesign-vue-next';
import { LinkIcon, FaceRetouchingIcon } from 'tdesign-icons-vue-next';
import { isIP } from 'is-ip';

import { setSubscribe } from '@/api/subscribe';
import { fetchInfo } from '@/api/system';
import { useUserStore } from '@/store';

const userStore = useUserStore();
const { toClipboard } = useClipboard();

const subscribeForm = ref({
  allow_ips: '',
  code: '',
  url: '',
  ip: '',
  type: 'all',
});

const isVisible = reactive({
  sub: false,
});

onMounted(() => {
  getIp();
});

const getIp = async () => {
  const response = await fetchInfo();

  if (response.code === 0) {
    subscribeForm.value.ip = response.data.ip;
  } else {
    MessagePlugin.error(response.msg);
  }
};

const getCode = async () => {
  if (!userStore.token) {
    MessagePlugin.warning('请先登录');
    return;
  }

  const allow_ips = subscribeForm.value.allow_ips.trim();
  if (!allow_ips) {
    MessagePlugin.warning('授权地址必填');
    return;
  } else {
    const allowIpsList = allow_ips
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip);
    if (allowIpsList.length > 5) {
      MessagePlugin.warning('最多添加5个IP地址');
      return;
    } else {
      let isValid = true; // 添加一个标志变量
      allowIpsList.forEach((ip) => {
        if (!isIP(ip)) {
          MessagePlugin.warning('IP地址有误');
          isValid = false; // 设置标志变量为false
          return; // 退出当前forEach循环的迭代
        }
      });

      // 检查所有IP是否都有效
      if (!isValid) {
        return; // 如果有无效的IP，直接退出函数
      }
    }
  }

  const response = await setSubscribe({
    allow_ips,
  });

  if (response.code === 0) {
    subscribeForm.value.code = response.data.code;
    const subUrl = `${window.location.origin}/api/v1/subscribe/${response.data.code}/sub?type=${subscribeForm.value.type}`;
    subscribeForm.value.url = subUrl;

    try {
      await toClipboard(subUrl);
    } catch {}
    isVisible.sub = true;
    // MessagePlugin.success(`订阅码: ${response.data.code}`);
    // MessagePlugin.success(`订阅链接: ${subUrl}`);
  } else if (response.code === -2) {
    await userStore.logout();
    MessagePlugin.info('登录凭证过期, 重新登录');
  } else {
    MessagePlugin.error(response.msg);
  }
};

const onClickConfirm = () => {
  isVisible.sub = false;
};
</script>

<style lang="less" scoped>
.view-container {
  .content {
    .card-item {
      .soico {
        background: url(@/assets/soico.svg) no-repeat;
        width: 150px;
        height: 150px;
        margin: 0 auto;
        background-size: cover;
        background-position: 0 15px;
        filter: drop-shadow(0px 5px 3px rgba(43, 48, 68, 0.4)) drop-shadow(0px 10px 16px rgba(43, 48, 68, 0.05));
      }

      .tip {
        margin: var(--td-comp-margin-m) 0;
        font-size: var(--td-font-size-body-medium);
        font-weight: bold;
        text-align: center;
      }

      .search-box {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-align-items: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-transition: all 0.3s;
        transition: all 0.3s;
        width: 100%;

        background-color: var(--td-bg-color-secondarycontainer);
        border-radius: var(--td-radius-medium);
        padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
        display: flex;
        align-items: center;

        :deep(.t-input--suffix) {
          border-radius: var(--td-radius-medium);
          border-style: dashed;
          box-shadow: none;
        }

        :deep(.t-input-adornment) {
          flex: 1;
        }

        .search-input {
          :deep(.t-input) {
            border-color: transparent;
            background-color: transparent;
          }

          :deep(.t-input--focused) {
            border-color: transparent;
            box-shadow: none;
          }
        }

        .search-button {
          min-width: 60px;
          width: 60px;
        }
      }

      .collapse {
        border-radius: var(--td-radius-medium);
        overflow: hidden;

        :deep(.t-collapse-panel__wrapper) {
          .t-collapse-panel__content {
            padding: var(--td-pop-padding-m);
          }
        }
      }
    }
  }
}
</style>
