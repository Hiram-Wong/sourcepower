<template>
  <div class="detail view-container">
    <div class="content">
      <t-alert theme="info" message="请勿相信数据源中任何广告!" close class="alert-item" />
      <t-alert v-if="detailData.sensitive" theme="error" message="当前敏感数据, 注意周围环境并调低音量!" close class="alert-item" />
      <t-card title="简介信息" :bordered="false" class="card-item t-card-tag">
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

      <t-card title="一键导入" :bordered="false" class="card-item t-card-tag detail-import">
        <t-space size="small">
          <t-popconfirm content="请确认zyplayer软件处于打开状态" @confirm="onShareZyplayer">
            <t-button variant="dashed">zyplayer</t-button>
          </t-popconfirm>
          <t-button variant="dashed" @click="onShareDrpyHiker">海阔视界</t-button>
        </t-space>
      </t-card>

      <t-card title="数据内容" :bordered="false" class="card-item t-card-tag detail-content">
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
            <p class="title">
              <span>扩展参数</span>
              <t-tooltip>
                <template #content>
                  <p v-for="(item, index) in DATA_EXT_INFO" :key="index" class="ext-tip">
                    {{ item.desc }}
                  </p>
                </template>
                <info-circle-icon size="16px" style="margin-left: 6px; padding-bottom: 2px;" />
              </t-tooltip>
            </p>
            <t-textarea :value="detailData.ext" :autosize="{ minRows: 3, maxRows: 5 }" :readonly="true"
              class="textarea" />
          </div>
        </t-watermark>
      </t-card>

      <t-card title="探讨交流" :bordered="false" class="card-item t-card-tag detail-comments">
        <t-comment :avatar="formatAvatar(userStore.email)" v-if="!active.replyDialog">
          <template #content>
            <submit-view v-model="commentFormData.content" @submit="onSubmitComment" />
          </template>
        </t-comment>

        <template v-for="item in commentData" :key="item.comment_id">
          <t-comment :avatar="formatAvatar(item.user.email)" :author="item.user.username"
            :datetime="formatDate(item.created_at)" class="comment-reply">
            <template #content>
              <div v-html="md.render(item.compiled_content)" class="chat-msg-content pa-3"></div>
            </template>
            <template #actions>
              <t-space key="chat" :size="6" @click="onSubmitCommentDialog(item.comment_id)">
                <chat-icon />
                <span>回复</span>
              </t-space>
              <t-space key="delete" :size="6" v-if="item.user.id === userStore.userInfo.id"
                @click="onDelComment(item.comment_id)">
                <delete-icon />
                <span>删除</span>
              </t-space>
            </template>

            <template #reply>
              <template v-for="reply in item.reply" v-if="item.reply_count !== 0">
                <t-comment :author="reply.user.username" :datetime="formatDate(reply.created_at)">
                  <template #author>
                    <span>{{ reply.user.username }}</span>
                    <span v-if="reply.to?.id">
                      <span style="margin: 0 2px; color: var(--td-text-color-secondary); font-weight: 400;">回复</span>
                      <span>{{ reply.to.username }}</span>
                    </span>
                  </template>
                  <template #content>
                    <div v-html="md.render(reply.compiled_content)" class="chat-msg-content pa-3"></div>
                  </template>
                  <template #actions>
                    <t-space key="chat" :size="6" @click="onSubmitReplyDialog(item.comment_id, reply.user)">
                      <chat-icon />
                      <span>回复</span>
                    </t-space>
                    <t-space key="delete" :size="6" v-if="reply.user.id === userStore.userInfo.id"
                      @click="onDelReply(item.comment_id, reply.reply_id)">
                      <delete-icon />
                      <span>删除</span>
                    </t-space>
                  </template>
                </t-comment>
              </template>

              <load-view :current="item.reply.length" :total="item.reply_count"
                @load="onLoadMoreReply(item.comment_id, item.reply.length)" v-if="item.reply_count !== 0" />
            </template>
          </t-comment>
        </template>

        <div class="reply-box-sticky" v-if="active.replyDialog">
          <submit-view v-model="commentFormData.content" @submit="onSubmitReply">
            <template #header>
              <div class="reply-box-header">
                <div class="left">
                  <span v-if="commentFormData.to.name">回复: {{ commentFormData.to.name }}</span>
                </div>
                <div class="right">
                  <div class="close-btn" @click="onCloseReplyDialog">
                    <close-icon />
                  </div>
                </div>
              </div>
            </template>
          </submit-view>
        </div>

        <load-view :current="commentData.length" :total="pagination.total" @load="onLoadMoreComment" />
      </t-card>
    </div>
  </div>
</template>

<script lang="js" setup>
import { computed, onMounted, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { LinkIcon, InfoCircleIcon, CloseIcon, ChatIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import hljs from "highlight.js";
import MarkdownIt from 'markdown-it';
import mathjax3 from 'markdown-it-mathjax3';

import findIndex from 'lodash/findIndex';

import { useUserStore } from '@/store';
import { fetchContentDetail } from '@/api/content';
import { fetchSubscribeCode } from '@/api/subscribe';
import { fetchComment, fetchReply, addReply, addComment, delReply, delComment } from '@/api/comment';
import { formatDate, formatAvatar } from '@/utils/tool';
import { base64 } from '@/utils/encode';
import request from '@/utils/request';
import { info } from '@/utils/info/ext';

import LoadView from '@/components/comment/load/index.vue';
import SubmitView from '@/components/comment/submit/index.vue';

const md = new MarkdownIt({
  linkify: true,
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return `<pre class="hljs-code-container my-3"><div class="hljs-code-header d-flex align-center justify-space-between bg-grey-darken-3 pa-1"></div><code class="hljs language-${language}">${hljs.highlight(code, { language: language, ignoreIllegals: true }).value}</code></pre>`;
  },
});
md.use(mathjax3);

const DATA_EXT_INFO = info;

const route = useRoute();
const userStore = useUserStore();

const detailId = computed(() => route.params.id);
const detailData = ref({});
const commentData = ref([]);
const pagination = ref({ current: 1, pageSize: 10, total: 0 });
const active = reactive({
  commentLoad: false,
  replyDialog: false
});
const commentFormData = ref({
  content: '',
  parent_id: null,
  to: {
    id: null,
    name: null
  }
});

onMounted(() => {
  if (userStore.token) {
    fetchData(detailId.value);
    fetchCommentData(detailId.value, pagination.value.current, pagination.value.pageSize);
  };
});

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
      MessagePlugin.error(`fail ${response.msg}`);
    };
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const fetchCommentData = async (id, page, size) => {
  try {
    const response = await fetchComment({
      id,
      page,
      size
    });

    if (response.code === 0) {
      commentData.value = commentData.value.concat(response.data.list);

      pagination.value.current += 1;
      pagination.value.total = response.data.total;
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    };
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const fetchReplyData = async (id, page, size) => {
  try {
    const response = await fetchReply({
      id,
      page,
      size
    });

    if (response.code === 0) {
      const index = findIndex(commentData.value, { comment_id: id });
      if (index !== -1) {
        commentData.value[index].reply = commentData.value[index].reply.concat(response.data.list);
      }
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    };
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const onLoadMoreComment = async () => {
  await fetchCommentData(detailId.value, pagination.value.current, pagination.value.pageSize);
};

const onLoadMoreReply = async (id, current) => {
  const limit = 3;
  const page = Math.ceil((current + 1) / limit);
  await fetchReplyData(id, page, limit);
};

const onSubmitComment = async () => {
  try {
    if (!userStore.token) {
      MessagePlugin.warning('请先登录');
      return;
    };

    if (!commentFormData.value.content.trim()) {
      MessagePlugin.warning('请先输入内容');
      return;
    }

    const response = await addComment({
      content_id: detailId.value,
      content: commentFormData.value.content
    });

    if (response.code === 0) {
      MessagePlugin.success('发表成功');

      resetCommentFormData();
      resetCommentData();
      fetchCommentData(detailId.value, pagination.value.current, pagination.value.pageSize);
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    };
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const onSubmitCommentDialog = async (id) => {
  active.replyDialog = true;

  commentFormData.value.parent_id = id;
};

const onSubmitReplyDialog = async (id, to) => {
  active.replyDialog = true;

  commentFormData.value.parent_id = id;
  commentFormData.value.to.id = to.id;
  commentFormData.value.to.name = to.username;
};

const onSubmitReply = async () => {
  try {
    if (!userStore.token) {
      MessagePlugin.warning('请先登录');
      return;
    };

    if (!commentFormData.value.content.trim()) {
      MessagePlugin.warning('请先输入内容');
      return;
    }

    const response = await addReply({
      comment_id: commentFormData.value.parent_id,
      to_id: commentFormData.value.to.id,
      content: commentFormData.value.content
    });

    if (response.code === 0) {
      MessagePlugin.success('提交成功');

      active.replyDialog = false;

      resetCommentFormData();
      resetCommentData();
      fetchCommentData(detailId.value, pagination.value.current, pagination.value.pageSize);
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    };
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const onDelComment = async (id) => {
  try {
    const response = await delComment(id);

    if (response.code === 0) {
      const index = findIndex(commentData.value, { comment_id: id });
      if (index !== -1) {
        commentData.value.splice(index, 1);
      }

      MessagePlugin.success('删除成功');
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    };
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const onDelReply = async (comment_id, reply_id) => {
  try {
    const response = await delReply(reply_id);

    if (response.code === 0) {
      const comment_index = findIndex(commentData.value, { comment_id: comment_id });

      if (comment_index !== -1) {
        const reply_index = findIndex(commentData.value[comment_index].reply, { reply_id: reply_id });
        commentData.value[comment_index].reply_count -= 1;
        if (reply_index !== -1) {
          commentData.value[comment_index].reply.splice(reply_index, 1);
        }
      }
      MessagePlugin.success('删除成功');
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    };
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const onCloseReplyDialog = () => {
  resetCommentFormData();
  active.replyDialog = false;
};

const resetCommentFormData = () => {
  commentFormData.value.content = '';
  commentFormData.value.to = { id: null, name: null };
  commentFormData.value.parent_id = null;
};

const resetCommentData = () => {
  pagination.value.current = 1;
  pagination.value.total = 0;
  commentData.value = [];
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
        api: formatExt?.type === 0 ? formatExt?.api ? formatExt.api : "./drpy_libs/drpy2.min.js" : "csp_XBPQ",
        playUrl: formatExt?.playUrl ? formatExt.playUrl : "",
        group: formatExt?.group ? formatExt.group : "默认",
        search: formatExt?.search ? formatExt.search : 1,
        isActive: true,
        type: formatExt?.type === 0 ? 7: 9,
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

    .detail-comments {
      :deep(.t-card__body) {
        position: relative;
      }

      .comment-box {
        .action-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--td-comp-margin-s);
        }
      }

      :deep(.t-comment) {
        padding: var(--td-comp-paddingTB-m) 0;

        .t-comment__inner {

          .t-comment__avatar {
            margin-right: var(--td-comp-margin-l);
          }

          .t-comment__avatar-image {
            width: var(--td-comp-size-l);
            height: var(--td-comp-size-l);
          }

          .t-comment__content {

            .t-comment__author {
              .t-comment__name {
                font: var(--td-font-title-small);
                max-width: 300px;
              }
            }

            .t-comment__actions {
              align-items: center;
              justify-content: flex-start;
              flex-direction: row;

              // :first-child {
              //   margin-left: -2px;
              // }
            }
          }
        }

        .t-comment__reply {
          margin-left: var(--td-comp-size-xxl);
        }
      }
    }
  }
}

.ext-tip {
  font: var(--td-font-body-small);
  padding: var(--td-comp-paddingTB-xxs) 0;
}

.reply-box-sticky {
  position: sticky;
  bottom: 20px;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-medium);
  outline: 2px solid var(--td-border-level-2-color);
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
  margin: 0 -10px;

  .reply-box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      max-width: 200px;
    }

    .right {
      .close-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--td-comp-size-xs);
        height: var(--td-comp-size-xs);
        color: var(--td-text-color-primary);
        border-radius: var(--td-radius-default);
        cursor: pointer;
        transition: background-color .2s;

        &:hover {
          background-color: var(--td-bg-color-container);
        }
      }
    }
  }

  .reply-box-main {
    margin-top: var(--td-comp-margin-xs);

    .content {
      border: 1px solid var(--td-border-level-2-color);
      border-radius: var(--td-radius-default);

      &:is(:focus, :focus-within) {
        border-color: var(--td-brand-color);
        box-shadow: 0 0 0 1px var(--td-brand-color-focus);
      }

      :deep(textarea) {
        border-color: transparent;
        box-shadow: none;
      }
    }

    // :deep(textarea:focus) .content {
    // }

    .tip {
      font-size: 12px;
      padding: 6px 10px;
      border-top: 1px dashed var(--td-border-level-2-color);
      color: var(--td-text-color-placeholder);
    }
  }

  .reply-box-footer {
    margin-top: var(--td-comp-margin-xs);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>