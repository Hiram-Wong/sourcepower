<template>
  <div class="home view-container">
    <div class="content">
      <t-card title="可持续源" :bordered="false" class="card-item t-card-tag">
        <div class="soico">
          <img src="@/assets/soico.webp" alt="soico" loading="lazy" />
        </div>
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
          <t-collapse-panel destroy-on-collapse header="授权说明">
            <p>1.当前请求地址: {{ subscribeForm.ip ? subscribeForm.ip : '未知' }}</p>
            <p>2.服务器无ipv6地址, 故不支持ipv6授权</p>
            <p>3.最多授权5个ip, 多ip使用半角逗号分隔</p>
            <p>4.本站根据用户公网ip授权, 故ip变动会导致数据失效</p>
            <p>5.重新授权只需重新提交即可</p>
          </t-collapse-panel>
          <t-collapse-panel header="使用方法">
            <p>1.使用邮箱注册账户[有账号则跳过]</p>
            <p>2.登录账户</p>
            <p>3.选择数据类型, 并输入授权的ip地址点击订阅</p>
            <p>4.在弹窗中获取订阅码链接</p>
          </t-collapse-panel>
          <t-collapse-panel header="白嫖原则">
            <p>1.仅供学习, 勿用于商业及引流</p>
            <p>2.请勿使用服务器爬虫</p>
            <p>3.每次请求均可溯源, 网络非法外之地</p>
            <p>4.切勿使用临时邮箱注册, 一经发现即删除账户</p>
          </t-collapse-panel>
        </t-collapse>
      </t-card>

      <t-card title="专属仓库" :bordered="false" class="card-item t-card-tag">
        <div class="personal">
          <p class="tip">制作属于自己数据, 请自行建立本地仓并维护。</p>
          <t-steps layout="vertical" :current="8" theme="dot" readonly>
            <t-step-item title="步骤一">
              <template #content>
                <p>1. 在本地创建文件夹</p>
                <p>
                  2. 下载必要的文件并解压 -
                  <t-link
                    theme="primary"
                    href="https://filedoge.com/download/c70bc3cc560d18e0e17d0f93b5e2d7f5673addc02871957ca7ad578b70a3422b40f0b95f95607571589e"
                    >点我下载</t-link
                  >
                </p>
              </template>
            </t-step-item>
            <t-step-item title="步骤二">
              <template #content>
                <p>1. 注册一个账号并登录</p>
                <p>2. 选择需要的数据</p>
                <p>3. 本地创建文件并将数据写入(影视为例)</p>
                <t-image-viewer :key="img2" :images="images" v-model:visible="isVisible.imageStep2" :default-index="0">
                  <template #trigger>
                    <div class="tdesign-demo-image-viewer__ui-image">
                      <img alt="test" :src="img2" class="tdesign-demo-image-viewer__ui-image--img" />
                      <div class="tdesign-demo-image-viewer__ui-image--hover" @click="onStepOpen(2)">
                        <span><BrowseIcon size="1.4em" /> 预览</span>
                      </div>
                    </div>
                  </template>
                </t-image-viewer>
              </template>
            </t-step-item>
            <t-step-item title="步骤三">
              <template #content>
                <p>修改index.json文件内容</p>
                <t-image-viewer :key="img3" :images="images" v-model:visible="isVisible.imageStep3" :default-index="1">
                  <template #trigger>
                    <div class="tdesign-demo-image-viewer__ui-image">
                      <img alt="test" :src="img3" class="tdesign-demo-image-viewer__ui-image--img" />
                      <div class="tdesign-demo-image-viewer__ui-image--hover" @click="onStepOpen(3)">
                        <span><BrowseIcon size="1.4em" /> 预览</span>
                      </div>
                    </div>
                  </template>
                </t-image-viewer>
              </template>
            </t-step-item>
            <t-step-item title="步骤四[可跳过]">
              <template #content>如需在线访问则将制作的所有内容上传至服务器</template>
            </t-step-item>
          </t-steps>
          <t-divider style="margin: var(--td-comp-margin-s) 0" />
          <p style="color: var(--td-text-color-placeholder); font-size: 12px">希望你是自用数据, 请勿用于商业和引流。</p>
        </div>
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
import { MessagePlugin } from 'tdesign-vue-next';
import { BrowseIcon, LinkIcon, FaceRetouchingIcon } from 'tdesign-icons-vue-next';
import { isIP } from 'is-ip';
import { useClipboard } from '@vueuse/core';

import { setSubscribe } from '@/api/subscribe';
import { fetchInfo } from '@/api/system';
import { useUserStore } from '@/store';

import ImgStep2 from '@/assets/personal/step2.png';
import ImgStep3 from '@/assets/personal/step3.png';

const userStore = useUserStore();

const img2 = ImgStep2;
const img3 = ImgStep3;
const images = [img2, img3];

const subscribeForm = ref({
  allow_ips: '',
  code: '',
  url: '',
  ip: '',
  type: 'all',
});

const isVisible = reactive({
  sub: false,
  imageStep2: false,
  imageStep3: false,
});

const onStepOpen = (type) => {
  switch (type) {
    case 2:
      isVisible.imageStep2 = true;
      break;
    case 3:
      isVisible.imageStep3 = true;
      break;
  }
};

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

    const { copy } = useClipboard({ source: subUrl });
    await copy();

    isVisible.sub = true;
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

const openImge = (type) => {
  switch (type) {
    case 2:
      MessagePlugin.info('该图片已失效');
      break;
    case 3:
      break;
  }
};
</script>

<style lang="less" scoped>
.view-container {
  .content {
    .card-item {
      .soico {
        width: 150px;
        height: 150px;
        margin: 0 auto;
        background-size: cover;
        background-position: 0 15px;

        img {
          height: 100%;
          width: 100%;
        }
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

      .personal {
        .tip {
          word-break: break-all;
          text-align: left;
          margin: var(--td-comp-margin-s) 0;

          &::before {
            content: '';
            border-radius: var(--td-radius-medium);
            border-left: 3px solid var(--td-brand-color);
            margin-right: var(--td-comp-margin-s);
          }
        }

        :deep(.t-steps--vertical.t-steps--positive) {
          .t-steps-item {
            padding: 0;
          }
        }

        .tdesign-demo-image-viewer__ui-image {
          width: 100%;
          height: 100px;
          display: inline-flex;
          position: relative;
          justify-content: center;
          align-items: center;
          border-radius: var(--td-radius-small);
          overflow: hidden;
        }

        .tdesign-demo-image-viewer__ui-image--hover {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          background-color: rgba(0, 0, 0, 0.6);
          color: var(--td-text-color-anti);
          line-height: 22px;
          transition: 0.2s;
        }

        .tdesign-demo-image-viewer__ui-image:hover .tdesign-demo-image-viewer__ui-image--hover {
          opacity: 1;
          cursor: pointer;
        }

        .tdesign-demo-image-viewer__ui-image--img {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          cursor: pointer;
          position: absolute;
        }

        .tdesign-demo-image-viewer__ui-image--footer {
          padding: 0 16px;
          height: 56px;
          width: 100%;
          line-height: 56px;
          font-size: 16px;
          position: absolute;
          bottom: 0;
          color: var(--td-text-color-anti);
          background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
          display: flex;
          box-sizing: border-box;
        }

        .tdesign-demo-image-viewer__ui-image--title {
          flex: 1;
        }

        .tdesign-demo-popup__reference {
          margin-left: 16px;
        }

        .tdesign-demo-image-viewer__ui-image--icons .tdesign-demo-icon {
          cursor: pointer;
        }

        .tdesign-demo-image-viewer__base {
          width: 160px;
          height: 160px;
          margin: 10px;
          border: 4px solid var(--td-bg-color-secondarycontainer);
          border-radius: var(--td-radius-medium);
        }
      }
    }
  }
}
</style>
