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
        <t-comment avatar="https://tdesign.gtimg.com/site/avatar.jpg">
          <template #content>
            <div class="comment-box">
              <t-textarea v-model="replyData" placeholder="请输入内容" :autosize="{ minRows: 3, maxRows: 5 }" />
              <div class="action-box">
                <div class="u-emoji"></div>
                <t-button class="btn-box" @click="submitReply">发表评论</t-button>
              </div>
            </div>
          </template>
        </t-comment>

        <template v-for="item in comments">
          <t-comment :avatar="item.user.avatar" :author="item.user.username" :datetime="item.createTime"
            :content="item.content" class="comment-reply">
            <template #actions>
              <t-space key="chat" :size="6">
                <t-icon name="chat" />
                <span>回复</span>
              </t-space>
            </template>

            <template #reply>
              <template v-for="reply in item.reply.list" v-if="item?.reply">
                <t-comment :author="reply.user.username" :datetime="reply.createTime" :content="reply.content">

                  <template #actions>

                    <t-space key="chat" :size="6">
                      <t-icon name="chat" />
                      <span>回复</span>
                    </t-space>
                  </template>
                </t-comment>
              </template>
            </template>
          </t-comment>
        </template>
      </t-card>
    </div>
  </div>
</template>

<script lang="js" setup>
import { computed, onMounted, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { LinkIcon, InfoCircleIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';

import { fetchContentDetail } from '@/api/content';
import { fetchSubscribeCode } from '@/api/subscribe';
import { formatDate } from '@/utils/tool';
import { base64 } from '@/utils/encode';
import request from '@/utils/request';
import { info } from '@/utils/info/ext';

const DATA_EXT_INFO = info;

const route = useRoute();

const id = computed(() => route.params.id);
const detailData = ref({});

const comments = [
  {
    id: '1',
    parentId: null,
    uid: '2',
    content: '床前明月光，疑是地上霜。<br>举头望明月，低头思故乡。<img class="a" id="a" style="width: 50px" src=a onerror="window.location.href=\'https://baidu.com\'">',
    createTime: new Date().toLocaleDateString(),
    user: {
      username: '李白 [唐代]',
      avatar: 'https://static.juzicon.com/images/image-231107185110-DFSX.png',
      homeLink: '/1'
    },
    reply: {
      total: 1,
      list: [
        {
          id: '11',
          parentId: 1,
          uid: '1',
          content: '[狗头][微笑2]',
          createTime: new Date().toLocaleDateString(),
          user: {
            username: '杜甫 [唐代]',
            avatar: 'https://static.juzicon.com/images/image-180327173755-IELJ.jpg',
          }
        },
        {
          id: '11',
          parentId: 1,
          uid: '1',
          content: '[狗头][微笑2]',
          createTime: new Date().toLocaleDateString(),
          user: {
            username: '杜甫 [唐代]',
            avatar: 'https://static.juzicon.com/images/image-180327173755-IELJ.jpg',
          }
        }
      ]
    }
  },
  {
    id: '2',
    parentId: null,
    uid: '3',
    content: '国破山河在，城春草木深。<br>感时花溅泪，恨别鸟惊心。<br>烽火连三月，家书抵万金。<br>白头搔更短，浑欲不胜簪。',
    createTime: new Date(),
    user: {
      username: '杜甫 [唐代]',
      avatar: 'https://static.juzicon.com/images/image-180327173755-IELJ.jpg'
    }
  },
  {
    id: '3',
    parentId: null,
    uid: '2',
    content: '日照香炉生紫烟，遥看瀑布挂前川。<br>飞流直下三千尺，疑是银河落九天。',
    likes: 34116,
    createTime: new Date(),
    user: {
      username: '李白 [唐代]',
      avatar: 'https://static.juzicon.com/images/image-231107185110-DFSX.png',
      homeLink: '/1'
    }
  }
]

// 模拟请求接口获取评论数据
setTimeout(() => {
  // 当前登录用户数据
  config.user = {
    id: 1,
    username: '杜甫 [唐代]',
    avatar: 'https://static.juzicon.com/images/image-180327173755-IELJ.jpg',
  }
  config.comments = comments
}, 500)

// 评论提交事件
let temp_id = 100
// 提交评论事件
const submit = ({ content, parentId, finish }) => {
  let str = '提交评论:' + content + ';\t父id: ' + parentId
  console.log(str)

  // 模拟请求接口生成数据
  const comment = {
    id: String((temp_id += 1)),
    parentId: parentId,
    uid: config.user.id,
    content: content,
    createTime: new Date().toString(),
    user: {
      username: config.user.username,
      avatar: config.user.avatar
    },
    reply: null
  }
  setTimeout(() => {
    finish(comment)
    UToast({ message: '评论成功!', type: 'info' })
  }, 200)
}

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

    .detail-comments {
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

              :first-child {
                margin-left: -2px;
              }
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
</style>