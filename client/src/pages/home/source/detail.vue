<template>
  <div class="detail view-container">
    <div class="content">
      <t-alert theme="info" message="请勿相信数据源中任何广告!" close class="alert-item" />
      <t-alert v-if="detailData.sensitive" theme="error" message="当前敏感数据, 注意周围环境并调低音量!" close class="alert-item" />
      <t-card title="简介信息" :bordered="false" class="card-item">
        <p class="title">{{ detailData.name }}</p>
        <p class="time">
          <span class="push">发布于 {{ formatDate(detailData.created_at) }}</span>
          <span>&nbsp;&nbsp;</span>
          <span class="update">更新于 {{ formatDate(detailData.updated_at) }}</span>
        </p>
        <div class="tag">
          <div class="type">
            <span v-if="detailData.type === 'site'">影视</span>
            <span v-else-if="detailData.type === 'live'">电视</span>
            <span v-else-if="detailData.type === 'parse'">解析</span>
          </div>
          <div class="sensitive">{{ detailData.sensitive ? '敏感' : '常规' }}</div>
        </div>
        <p class="desc">{{ detailData.desc ? detailData.desc : "空空如也" }}</p>
        <t-divider dashed />
        <div class="post-user">
          <t-link :href="`mailto:${detailData.email}`" target="_blank">
            <strong>{{ detailData.username }}</strong>
          </t-link>
          <span class="provide">提供</span>
        </div>
      </t-card>

      <t-card title="一键导入" :bordered="false" class="card-item detail-import">
        <t-space size="small">
          <t-popconfirm content="请确认zyplayer软件处于打开状态" @confirm="onShareZyplayer">
            <t-button variant="dashed">zyplayer</t-button>
          </t-popconfirm>
          <t-button variant="dashed" @click="onShareDrpyHiker">海阔视界</t-button>
        </t-space>
      </t-card>

      <t-card title="数据内容" :bordered="false" class="card-item detail-content">
        <t-watermark :watermark-content="{
          text: '源动力',
        }" :width="120" :height="60" :y="30" :x="60" class="detail-watermark">
          <div v-if="detailData.data" class="detail-content-item">
            <p class="title" style="margin-top: 0;">主要参数</p>
            <div>
              <t-link v-if="formatUrl(detailData.data)" :href="detailData.data" target="_blank"
                style="word-break: break-all;">
                <template #prefix-icon>
                  <link-icon />
                </template>
                {{ detailData.data }}</t-link>
              <t-textarea v-else :value="detailData.content" :autosize="{ minRows: 3, maxRows: 10 }" :readonly="true"
                class="textarea" />
            </div>
          </div>
          <div v-if="detailData.ext" class="detail-content-item">
            <p class="title">扩展参数</p>
            <t-textarea :value="detailData.ext" :autosize="{ minRows: 3, maxRows: 5 }" :readonly="true"
              class="textarea" />
          </div>
        </t-watermark>
      </t-card>
    </div>
  </div>
</template>

<script lang="js" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { LinkIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';

import { fetchContentDetail } from '@/api/content';
import { fetchSubscribeCode } from '@/api/subscribe';
import { formatDate } from '@/utils/tool';
import { base64 } from '@/utils/encode';
import request from '@/utils/request';

const route = useRoute();

const id = computed(() => route.params.id);
const detailData = ref({});

onMounted(() => {
  fetchData(id.value)
})

const formatUrl = (str) => {
  if (str && typeof str === "string" && str.startsWith('http')) {
    return true;
  } else return false;
};

const fetchData = async (id) => {
  try {
    const response = await fetchContentDetail(id);

    if (response.code === 0) {
      detailData.value = response.data;
    } else {
      MessagePlugin.error(response.msg);
    };
  } catch (err) {
    MessagePlugin.error(err);
  }
};

const onShareDrpyHiker = async () => {
  const response_code = await fetchSubscribeCode();
  if (response_code.code !== 0) {
    MessagePlugin.warning(`fail ${response_code.msg}`);
    return;
  }

  if (detailData.value.type === "site") {
    let content = detailData.value.content;
    if (formatUrl(detailData.value.data)) {
      const response = await request({
        url: detailData.value.data,
        method: "get"
      });
      content = response;
    }
    const response = await request({
      url: "https://pasteme.tyrantg.com/api/create",
      method: "post",
      data: {
        content: base64.encode(content)
      }
    });
    if (response.return_code === 0) {
      const uuid = response.data.path;
      const template = `海阔视界，DRPY视频源「${detailData.value.name}」复制整条口令打开软件就会自动导入$云6oooole/xxxxxx/${uuid}$${detailData.value.name}.js@import=js:$.require('import?rule='+"DrpyHiker")(input, true)`
      const confirmDia = DialogPlugin({
        header: '海阔视界口令分享',
        body: template,
        confirmBtn: '确定',
        cancelBtn: '取消',
        onConfirm: ({ e }) => {
          confirmDia.hide();
        },
        onClose: ({ e, trigger }) => {
          confirmDia.hide();
        },
      });
    } else {
      MessagePlugin.error('生成分享口令失败')
    }
  } else if (detailData.value.type === "live") {
    MessagePlugin.warning('暂不支持该类型数据导入');
  } else if (detailData.value.type === "parse") {
    MessagePlugin.warning('暂不支持该类型数据导入');
  }
};

const onShareZyplayer = async () => {
  try {
    const response_code = await fetchSubscribeCode();
    if (response_code.code !== 0) {
      MessagePlugin.warning(`fail ${response_code.msg}`);
      return;
    }
    const BASE_API_URL = `${window.location.origin}/api/v1/subscribe/${response_code.data.code}/`;

    let response;
    if (detailData.value.type === "site") {
      const ext = detailData.value.ext ? detailData.value.ext : {};
      const formatExt = typeof ext === 'string' ? JSON.parse(ext) : ext;
      const formatData = detailData.value.data.startsWith('http') ? detailData.value.data : new URL(`${BASE_API_URL}${detailData.value.data}`).href;
      const data = {
        name: detailData.value.name,
        api: formatExt?.api ? formatExt.api : "./drpy_libs/drpy2.min.js",
        playUrl: formatExt?.playUrl ? formatExt.playUrl : "",
        group: formatExt?.group ? formatExt.group : "默认",
        search: formatExt?.search ? formatExt.search : 1,
        isActive: true,
        type: 7,
        ext: formatData,
        categories: formatExt?.categories ? formatExt.categories : "",
      }
      response = await request({
        url: 'http://127.0.0.1:9978/api/v1/site',
        method: "post",
        data
      });
    } else if (detailData.value.type === "live") {
      const ext = detailData.value.ext ? detailData.value.ext : {};
      const formatExt = typeof ext === 'string' ? JSON.parse(ext) : ext;
      const formatData = detailData.value.data.startsWith('http') ? detailData.value.data : new URL(`${BASE_API_URL}${detailData.value.data}`).href;

      const data = {
        name: detailData.value.name,
        epg: formatExt?.epg ? formatExt.epg : "",
        isActive: true,
        type: "remote",
        url: formatData
      }

      response = await request({
        url: 'http://127.0.0.1:9978/api/v1/iptv',
        method: "post",
        data
      });
    } else if (detailData.value.type === "parse") {
      const ext = detailData.value.ext ? detailData.value.ext : {};
      const formatExt = typeof ext === 'string' ? JSON.parse(ext) : ext;
      const formatData = detailData.value.data.startsWith('http') ? detailData.value.data : new URL(`${BASE_API_URL}${detailData.value.data}`).href;

      const data = {
        isActive: true,
        name: detailData.value.name,
        type: formatExt?.type ? formatExt.type : 0,
        url: formatData
      }

      response = await request({
        url: 'http://127.0.0.1:9978/api/v1/analyze',
        method: "post",
        data
      });
    }

    if (response?.id) {
      MessagePlugin.success('添加成功, 请手动刷新 zyplayer 页面');
    } else {
      MessagePlugin.warning('添加失败');
    }
  } catch (err) {
    console.log(err);
    MessagePlugin.warning(`fail ${err.message}`);
  }
};
</script>

<style lang="less" scoped>
.view-container {
  .content {
    .alert-item {
      margin-bottom: var(--td-comp-margin-m);
    }

    .card-item {
      .title {
        font-weight: 500;
        color: var(--td-text-color-primary);
      }

      .time {
        font: var(--td-font-body-small);
        color: var(--td-text-color-placeholder);
      }

      .desc {
        margin: var(--td-comp-margin-s) 0;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
      }

      .tag {
        background-color: var(--td-bg-color-container-active);
        display: flex;
        border-radius: var(--td-radius-medium);
        margin-top: var(--td-comp-margin-xs);
        width: fit-content;

        .type {
          background-color: var(--td-bg-color-component-hover);
          border-radius: var(--td-radius-medium);
          padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingTB-s);
        }

        .sensitive {
          border-radius: var(--td-bg-color-component-disabled);
          padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingTB-s);
        }
      }

      :deep(.t-divider) {
        margin: var(--td-comp-margin-xs) 0;
      }

      .post-user {
        font-size: 12px;
        display: flex;
        align-items: center;

        strong {
          max-width: 70px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 var(--td-comp-paddingLR-xs) 0 0;
        }

        .provide {
          color: var(--td-text-color-placeholder);
        }
      }
    }

    .detail-content {
      .detail-watermark {
        > :deep(div):first-child {
          z-index: 999;
        }
      }

      .detail-content-item {
        .title {
          text-align: left;
          font-weight: 500;
          margin: var(--td-comp-margin-s) 0;

          &::before {
            content: "";
            border-radius: var(--td-radius-medium);
            border-left: 3px solid var(--td-brand-color);
            margin-right: var(--td-comp-margin-s);
          }
        }

        :deep(.t-textarea) {
          border-radius: var(--td-radius-medium);
          border-width: 2px;
          z-index: 998;
        }
      }
    }
  }
}
</style>