<template>
  <div class="about-container view-container">
    <div class="content">
      <t-card title="捐助列表" :bordered="false" class="card-item">
        <p style="text-align: center;">
          <span>捐赠为自愿行为, 不构成合同关系</span>
        </p>
        <p style="text-align: center;">
          <span>微信｜支付宝 扫描下方二维码发起捐赠</span>
        </p>
        <div class="donate-method">
          <div class="left-thanks">
            <img src="@/assets/thanks-left.png">
          </div>
          <div class="qr-code">
            <img src="@/assets/pay.png">
            <span class="remark">请备注: 源动力</span>
          </div>
          <div class="right-thanks">
            <img src="@/assets/thanks-right.png">
          </div>
        </div>
        <div class="donate-main">
          <iframe ref="iframeRef" :src="donateUrl" frameborder="0" class="donate-iframe"></iframe>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted, useTemplateRef, nextTick } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { fetchDonate } from '@/api/system';

const iframeRef = useTemplateRef('iframeRef');
const donateUrl = ref('about:blank');

onMounted(() => {
  getData();
})

const getData = async () => {
  const response = await fetchDonate();

  if (response.code === 0) {
    donateUrl.value = response.data;
  } else {
    MessagePlugin.error(response.msg);
  };
};

const adjustIframeStyle = () => {
  if (!iframeRef.value) return;


};
</script>

<style scoped lang="less">
.view-container {
  .content {
    .donate-method {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-evenly;

      .qr-code,
      .left-thanks,
      .right-thanks {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;

        img {
          width: 100%;
        }
      }

      .qr-code {
        img {
          width: 40%;
        }

        .remark {
          font-size: var(--td-font-body-small);
          font-weight: 500;
          color: var(--td-brand-color);
        }
      }
    }

    .donate-main {
      width: 100%;
      height: 650px;
      overflow: hidden;
      position: relative;
      border-radius: var(--td-radius-medium);

      .donate-iframe {
        position: absolute;
        top: -210px;
        width: 100%;
        height: calc(650px + 210px);
      }
    }

    @media (max-width: 750px) {
      .donate-main {
        .donate-iframe {
          top: -105px;
          height: calc(650px + 105px);
        }
      }
    }
  }
}
</style>