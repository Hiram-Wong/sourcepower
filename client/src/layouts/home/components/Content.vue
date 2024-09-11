<template>
  <t-row :gutter="16" class="container">
    <t-col :xs="12" :sm="8">
      <router-view v-if="isRouterAlive" v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="Component" :key="activeRouteFullPath" class="t-component" />
          </keep-alive>
        </transition>
      </router-view>
    </t-col>
    <t-col :xs="12" :sm="4" class="widget-area">
      <div class="widget">
        <t-card title="公告通知" :bordered="false" class="card-item">
          <p style="text-align: center;">
            <span v-html="notice"></span>
          </p>
        </t-card>
        <t-card title="特别赞助" :bordered="false" class="card-item">
          <div class="donate-poem">
            <p>网站现在不盈利</p>
            <p>全靠捐助养自己</p>
            <p>如果有幸帮到你</p>
            <p style="margin-bottom: 12px;">捐助我们别吝惜</p>
            <t-button shape="round" variant="dashed" @click="clickLink('/donate')">
              <template #icon><gift-icon /></template>
              捐助我们
            </t-button>
          </div>
        </t-card>
        <t-card title="免责申明" :bordered="false" class="card-item">
          <div class="">
            <p>1.本站仅供学习, 不保证时效性。</p>
            <p>2.数据由网友提供，本站仅为集合展示。</p>
            <p>3.如有内容违规，请来信告知。</p>
          </div>
        </t-card>
        <t-card title="找到我们" :bordered="false" class="card-item">
          <div class="contact-us">
            <div class="item">
              <a @click="copyWxLink">
                <t-avatar class="avatar"
                  image="data:image/png;base64,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" />
                <span>微信关注 @HiramWong</span>
              </a>
            </div>
            <div class="item">
              <a href="https://t.me/+IOovrYLP7gYwYmNl" target="_blank">
                <t-avatar class="avatar"
                  image="data:image/png;base64,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" />
                <span>加入 TG 群组</span>
              </a>
            </div>
            <div class="item">
              <a href="mailto:hiram@catni.cn" target="_blank">
                <t-avatar class="avatar"
                  image="data:image/png;base64,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" />
                <span>飞鸽传邮件</span>
              </a>
            </div>
          </div>
        </t-card>
        <div class="footer footer-component">
          <p>
            © 2024 <span>源动力</span>
          </p>
          Designed by Hiram
        </div>
      </div>
    </t-col>
  </t-row>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { GiftIcon } from 'tdesign-icons-vue-next';

import { fetchNotice } from '@/api/system';

const router = useRouter();

const activeRouteFullPath = computed(() => {
  return router.currentRoute.value.fullPath;
});

const isRouterAlive = ref(true);

const notice = ref('空空如也');

onMounted(() => {
  getNotice();
});

const getNotice = async () => {
  try {
    const response = await fetchNotice();
    if (response.code === 0) {
      notice.value = response.data;
    } else {
      MessagePlugin.error(`获取公告失败${response.msg}`);
    }
  } catch (err) {
    MessagePlugin.error(err);
  }
}

const clickLink = (url) => {
  router.push(url);
}

const copyWxLink = () => {
  navigator.clipboard.writeText(`HiramWong`);
  MessagePlugin.info('公众号 ID 已拷贝到您的剪切板啦~')
}
</script>

<style lang="less" scoped>
.fade-leave-active,
.fade-enter-active {
  transition: opacity @anim-duration-slow @anim-time-fn-easing;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.t-component {
  height: 100%;
  width: 100%;
  margin-bottom: var(--td-comp-margin-m);
}

.container {
  height: 100%;
  width: 1060px;
  margin: var(--td-comp-margin-m) auto 0 !important;

  :deep(.t-card__header) {
    padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-xl);
  }

  :deep(.t-card__body) {
    padding: 0 var(--td-comp-paddingLR-xl) var(--td-comp-paddingTB-l);
  }

  .widget-area {
    position: sticky;
  }

  .card-item {
    margin-bottom: var(--td-comp-margin-m);

    &:last-child {
      margin-bottom: 0;
    }

    .donate-poem {
      text-align: center;
    }

    .contact-us {
      .item {
        padding: 8px 0;

        a {
          color: var(--td-text-color-primary);
          text-decoration: none;
          -webkit-transition: all .3s ease;
          -moz-transition: all .3s ease;
          -ms-transition: all .3s ease;
          -o-transition: all .3s ease;
          transition: all .3s ease;
          cursor: pointer;

          :hover {
            color: var(--td-brand-color);
          }

          .avatar {
            margin-right: var(--td-comp-margin-m);
          }
        }
      }
    }
  }

  .footer-component {
    padding: 0 40px;
    text-align: center;
  }

  .footer {
    line-height: 22px;
    letter-spacing: .4px;
    margin-bottom: 30px;
    color: var(--td-text-color-placeholder);
    font: var(--td-font-body-small);
    font-weight: 500;
  }
}

@media (max-width: 750px) {
  .container {
    width: 100%;
  }
}
</style>
