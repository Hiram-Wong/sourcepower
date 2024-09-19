<template>
  <div class="guidance view-container">
    <div class="container">
      <div class="top-guidance">
        <img src="@/assets/guidance/top-click.png" class="top-bar-guidance-bg" />
        <div class="top-bar-guidance-text">
          <p>
            点击右上角<img src="@/assets/guidance/safari.png" class="icon-safari" />
            <span id="openm">Safari打开</span>
          </p>
          <p>可以继续浏览本站哦~</p>
        </div>
      </div>
      <div class="contens-guidance">
        <p>1.本站点不支持腾讯系软件中预览</p>
        <p>2.请在系统浏览器打开访问</p>
        <p>3.推荐使用Chrome预览</p>
      </div>
      <div class="bottom-guidance">
        <div class="browser">
          <div @click="openSystemBrowser('mttbrowser')">
            <img src="@/assets/guidance/qq.png" />
          </div>
          <div @click="openSystemBrowser('quarkbrowser')">
            <img src="@/assets/guidance/quark.png" />
          </div>
          <div @click="openSystemBrowser('googlechrome')">
            <img src="@/assets/guidance/chrome.png" />
          </div>
          <div @click="openSystemBrowser('ucbrowser')">
            <img src="@/assets/guidance/uc.png" />
          </div>
        </div>
        <div class="app-download-tip">
          <span class="guidance-desc">点击上方图标or复制本站网址自行打开</span>
        </div>
        <div class="app-download-btn" @click="copyText">点此复制本站网址</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed } from 'vue';
import { useClipboard } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';

const url = computed(() => window.location.href);
const { copy } = useClipboard({ source: url.value });

const copyText = async () => {
  try {
    await copy();
    MessagePlugin.success('已复制到剪贴板');
  } catch (error) {
    MessagePlugin.error('复制到剪贴板失败');
  }
};

const openSystemBrowser = (type) => {
  const url = window.location.href;

  const dict = {
    ucbrowser: 'ucbrowser://',
    mttbrowser: 'mttbrowser://url=',
    baiduboxapp: 'baiduboxapp://browse?url=',
    googlechrome: 'googlechrome://browse?url=',
    mibrowser: 'mibrowser:',
    quarkbrowser: 'quarkbrowser://url=',
    alipays: 'alipays://platformapi/startapp?appId=20000067&url=',
  };

  const openurl = dict[type] + url;

  window.location.href = openurl;
};
</script>

<style lang="less" scoped>
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;

  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

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
        padding-left: 20px;
        padding-top: 20px;
        font: var(--td-font-title-medium);
        color: var(--td-bg-color-container);
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
      margin: 0 auto;

      p {
        font: var(--td-font-mark-medium);
        text-align: center;
      }
    }

    .bottom-guidance {
      margin: 0 auto;
      text-align: center;
      margin-bottom: var(--td-comp-paddingTB-m);

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
        .guidance-desc {
          font: var(--td-font-link-small);
        }
      }

      .app-download-btn {
        cursor: pointer;
        display: block;
        width: 214px;
        height: 30px;
        line-height: 25px;
        text-align: center;
        font-size: var(--td-font-size-title-medium);
        border-radius: var(--td-radius-round);
        border: 2px var(--td-text-color-brand) dashed;
        margin: var(--td-comp-paddingTB-m) auto 0;
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
