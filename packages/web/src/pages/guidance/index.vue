<template>
  <div class="guidance view-container">
    <div class="container">
      <div class="top-guidance">
        <img src="@/assets/guidance/top-click.png" class="top-bar-guidance-bg" />
        <div class="top-bar-guidance-text">
          <p>检测到当前使用应用内置浏览器打开</p>
          <p>请使用系统浏览器浏览</p>
          <p>点击右上角的..., 选择在默认浏览器中打开</p>
        </div>
      </div>
      <a style="display: none" href="" id="vurl" rel="noreferrer"></a>
      <div class="contens-guidance">
        <div class="safe-icon">
          <svg
            t="1726906469974"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="18796"
            width="256"
            height="256"
          >
            <path
              d="M512 182.656l284.8768 134.0672v307.2c0 110.1056-196.224 193.7664-284.8768 221.2864-88.704-27.5456-284.8768-111.2064-284.8768-221.2864v-307.2L512 182.656M512 115.2L166.0672 277.9904v345.9328C166.0672 814.976 512 908.8 512 908.8s345.9328-93.824 345.9328-284.8768V277.9904L512 115.2z"
              p-id="18797"
            ></path>
            <path
              d="M512 227.1232l244.1728 115.3024v264.1664c0 94.6688-168.192 166.6304-244.1728 190.2848-76.032-23.68-244.1984-95.6416-244.1984-190.2848v-264.192L512 227.1232"
              fill="#00FFAA"
              opacity=".1"
              p-id="18798"
            ></path>
            <path
              d="M449.1776 648.1408c-8.0896 0-15.8464-3.2256-21.5808-8.9344l-85.5296-85.5552a30.4896 30.4896 0 1 1 43.1616-43.1616l63.9488 63.9744 189.6192-189.6448a30.4896 30.4896 0 1 1 43.1616 43.1616l-211.2 211.2256a30.6176 30.6176 0 0 1-21.5808 8.9344z"
              fill="#17E5A1"
              p-id="18799"
            ></path>
          </svg>
        </div>
        <p class="safe-tip">已通过自主安全检测</p>
        <div class="browser-boot">
          <img src="@/assets/guidance/browser-boot.png" alt="browser-boot" />
        </div>
      </div>
      <div class="bottom-guidance">
        <div class="browser">
          <div v-for="(browser, type) in BROWSERS" :key="type" @click="openSystemBrowser(type)">
            <img :src="browser.icon" :alt="type" />
          </div>
        </div>
        <div class="app-download-tip">
          <span class="guidance-desc">点击上方图标or复制本站网址自行打开</span>
        </div>
        <div class="app-download-btn" @click="copyText">
          <span>点此复制本站网址</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, onMounted } from 'vue';
import { useClipboard } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';

import qqBrowserIcon from '@/assets/guidance/qq.png';
import chromeBrowserIcon from '@/assets/guidance/chrome.png';
import baiduBrowserIcon from '@/assets/guidance/baidu.png';
import quarkBrowserIcon from '@/assets/guidance/quark.png';
import ucBrowserIcon from '@/assets/guidance/uc.png';

const BROWSERS = {
  quarkbrowser: { urlPrefix: 'quark://', icon: quarkBrowserIcon },
  googlechrome: { urlPrefix: 'googlechrome://', icon: chromeBrowserIcon },
  ucbrowser: { urlPrefix: 'ucbrowser://', icon: ucBrowserIcon },
  mttbrowser: { urlPrefix: 'mttbrowser://url=', icon: qqBrowserIcon },
  baiduboxapp: { urlPrefix: 'baiduboxapp://browse?url=', icon: baiduBrowserIcon },
};

const url = computed(() => window.location.href);
const { copy } = useClipboard({ source: url.value });

onMounted(() => {
  document.title = '请在系统浏览器打开';
});

const copyText = async () => {
  try {
    await copy();
    MessagePlugin.success('已复制到剪贴板');
  } catch (error) {
    MessagePlugin.error('复制到剪贴板失败');
  }
};

document.querySelector('body').addEventListener('touchmove', function (event) {
  event.preventDefault();
});

const openSystemBrowser = (type) => {
  let openUrl = `${BROWSERS[type].urlPrefix}${url.value}`;
  if (type === 'googlechrome') {
    openUrl = openUrl.replace('http://', '').replace('https://', '');
  }
  const linkElement = document.createElement('a');
  linkElement.href = openUrl;
  linkElement.rel = 'noreferrer';
  linkElement.style.display = 'none';
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
};
</script>

<style lang="less" scoped>
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: var(--td-bg-color-page);

  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--td-bg-color-container);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    width: 460px;
    min-height: 600px;
    overflow: hidden;
    box-shadow: var(--td-shadow-3);
    border-radius: var(--td-radius-medium);

    .top-guidance {
      width: 100%;
      margin: 0 auto;
      position: relative;

      .top-bar-guidance-bg {
        width: 100%;
      }

      .top-bar-guidance-text {
        position: absolute;
        top: 0;
        padding: var(--td-comp-paddingTB-m) 0 0 var(--td-comp-paddingTB-m);
        font: var(--td-font-title-medium);
        color: var(--td-gray-color-1);
      }

      .icon-safari {
        width: 25px;
        height: 25px;
        vertical-align: middle;
        margin: 0 0.2em;
      }
    }

    .contens-guidance {
      width: 100%;
      margin: var(--td-comp-margin-m) auto;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .safe-tip {
        font: var(--td-font-title-medium);
        text-align: center;
        color: var(--td-brand-color);
      }

      .safe-icon {
        text-align: center;
        height: 128px;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      .browser-boot {
        overflow: hidden;
        border-radius: var(--td-radius-medium);
        width: 80%;
        margin: 0 auto;

        img {
          width: 100%;
          object-fit: cover;
          height: 100%;
        }
      }
    }

    .bottom-guidance {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 6px;
      margin-bottom: var(--td-comp-paddingTB-xl);

      .browser {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 6px;

        img {
          width: 50px;
        }
      }

      .app-download-tip {
        margin: 0 auto;
        display: flex;
        border-top: 0;
        white-space: nowrap;
        align-items: center;

        &:before,
        &:after {
          content: '';
          width: 20px;
          border-top: 1px solid var(--td-border-level-1-color);
        }
        .guidance-desc {
          padding: 0 var(--td-comp-paddingLR-s);
          font: var(--td-font-link-small);
        }
      }

      .app-download-btn {
        height: var(--td-comp-size-m);
        font: var(--td-font-body-medium);
        padding-left: calc(var(--td-comp-paddingLR-l) - 1px);
        padding-right: calc(var(--td-comp-paddingLR-l) - 1px);
        background-color: var(--td-bg-color-specialcomponent);
        border-style: dashed;
        border-radius: var(--td-radius-round);
        color: var(--td-brand-color);
        border-color: var(--td-brand-color);

        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        span {
          position: relative;
          z-index: 1;
          display: inline-flex;
        }
      }
    }
  }

  @media (max-width: 750px) {
    .container {
      width: 100%;
      height: 100%;
      border-radius: 0;
      transform: none;
      top: 0;
      left: 0;
      position: relative;
    }
  }
}
</style>
