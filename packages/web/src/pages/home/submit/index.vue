<template>
  <div class="submit-container view-container">
    <div class="content">
      <t-card title="学习课堂" :bordered="false" class="card-item t-card-tag create">
        <p class="title">三步学会属于你自己的创作</p>
        <div class="step-info step-item">
          <p class="use-title">
            <span>1. 工具: </span>
            <t-link href="https://zy.catni.cn/edit-source.html" target="_blank">zyplayer</t-link>
          </p>
          <p class="content">精通工具使用, 提升创作效率。</p>
        </div>
        <div class="step-info step-item">
          <p class="use-title">
            <span>2. 教程:</span>
            <t-link href="https://zy.catni.cn/edit-grammar.html" target="_blank">语法</t-link>
          </p>
          <p class="content">掌握基础语法, 为实战打下基石</p>
        </div>
        <div class="step-info step-item">
          <p class="use-title">
            <span>3. 视频: </span>
            <t-link href="https://www.alipan.com/s/1hKBsq3ifDk" target="_blank">阿里云盘</t-link>
          </p>
          <p class="content">跟随视频教程，逐步提升实战技能</p>
        </div>
      </t-card>

      <t-card title="创作投递" :bordered="false" class="card-item t-card-tag">
        <div class="tips" ref="submiteRef">
          <p class="tip">1.感谢您的支持, 提交前确保您是登录状态</p>
          <p class="tip">2.上传后即创作者授权平台拥有宣传分发权利</p>
          <p class="tip">3.数据内容需审核通过后展示</p>
          <p class="tip">4.请勿频繁触发文件上传, 会拉黑</p>
          <p class="tip">5.10s内多次提交仅第一次提交成功</p>
        </div>
        <div class="submit-type">
          <t-radio-group v-model="active.dialog" variant="default-filled" v-if="historyList.length > 0">
            <t-radio-button value="add">新增</t-radio-button>
            <t-radio-button value="edit">编辑</t-radio-button>
          </t-radio-group>
        </div>
        <t-form
          label-align="right"
          :rules="FORM_RULES"
          :data="formData.data"
          :label-width="70"
          @reset="onReset"
          @submit="onSubmit"
        >
          <t-form-item label="名称" name="name">
            <t-input v-model="formData.data.name" placeholder="请输入名称, 如xx影视"></t-input>
          </t-form-item>

          <t-form-item label="类型" name="type">
            <t-radio-group v-model="formData.data.type">
              <t-radio value="site">影视</t-radio>
              <t-radio value="live">电视</t-radio>
              <t-radio value="parse">解析</t-radio>
            </t-radio-group>
          </t-form-item>

          <t-form-item name="sensitive">
            <template #label>
              <span>敏感</span>
              <t-tooltip content="涩涩和哎呦疼等均数据敏感资源">
                <info-circle-icon size="16px" style="margin-left: 3px; padding-bottom: 2px" />
              </t-tooltip>
            </template>
            <t-radio-group v-model="formData.data.sensitive" variant="default-filled">
              <t-radio-button :value="true">是</t-radio-button>
              <t-radio-button :value="false">否</t-radio-button>
            </t-radio-group>
          </t-form-item>

          <t-form-item label="数据" name="data">
            <t-input v-model="formData.data.data" placeholder="直链则输入, 文件则上传"></t-input>
            <div clas="data-upload" :style="{ marginLeft: 'var(--td-comp-margin-s)', width: '112px' }">
              <t-upload
                v-if="countDown === 0"
                v-model="files"
                :size-limit="{ size: 1, unit: 'MB' }"
                :allow-upload-duplicate-file="true"
                :multiple="false"
                :request-method="requestMethod"
                theme="file"
              ></t-upload>
              <t-button v-else variant="outline" disabled :style="{ width: '100%' }">
                {{ `${countDown}秒后可上传` }}
              </t-button>
            </div>
          </t-form-item>

          <t-form-item label="描述" name="desc">
            <t-textarea
              v-model="formData.data.desc"
              placeholder="请输入介绍, 如来源、域名、访问速度、质量、有无广告等"
            ></t-textarea>
          </t-form-item>

          <t-form-item name="ext">
            <template #label>
              <span>扩展</span>
              <t-tooltip>
                <template #content>
                  <p v-for="(item, index) in DATA_EXT_INFO" :key="index" class="ext-tip">
                    {{ item.desc }}
                  </p>
                </template>
                <info-circle-icon size="16px" style="margin-left: 3px; padding-bottom: 2px" />
              </t-tooltip>
            </template>
            <t-textarea v-model="formData.data.ext" placeholder="填写字典格式"></t-textarea>
          </t-form-item>

          <t-form-item>
            <t-space size="small">
              <t-button theme="primary" type="submit">提交</t-button>
              <t-button theme="default" variant="base" type="reset">重置</t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </t-card>

      <t-card title="历史记录" :bordered="false" class="card-item t-card-tag" v-if="historyList.length > 0">
        <t-list :async-loading="asyncLoading" split @load-more="loadMore">
          <t-list-item v-for="item in historyList" :key="item.id">
            <t-list-item-meta>
              <template #title>
                {{ item.name }}
              </template>
              <template #description> 发布于 {{ formatDate(item.created_at) }} </template>
            </t-list-item-meta>
            <template #action>
              <span>
                <span>
                  <t-tag v-if="item.audit === 0" shape="round" theme="success">通过</t-tag>
                  <t-tag v-else-if="item.audit === -2" shape="round" theme="danger">未通过</t-tag>
                  <t-tag v-else-if="item.audit === -1" shape="round" theme="default">待审核</t-tag>
                </span>
                <t-link
                  v-if="item.audit === 0"
                  theme="primary"
                  hover="color"
                  style="margin-left: 16px"
                  @click="handleDetail(item.id)"
                  >详情</t-link
                >
                <t-link theme="primary" hover="color" style="margin-left: 16px" @click="onEdit(item)">修改</t-link>
              </span>
            </template>
          </t-list-item>
        </t-list>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="js">
import { reactive, ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { InfoCircleIcon } from 'tdesign-icons-vue-next';
import clone from 'lodash/clone';
import throttle from 'lodash/throttle';

import { useCounter } from '@/hooks';
import { useUserStore } from '@/store';
import { addContent, fetchContentHistory, putContent } from '@/api/content';
import { upload } from '@/api/system';
import { formatDate } from '@/utils/tool';
import { info } from '@/utils/info/ext';

const DATA_EXT_INFO = info;
const FORM_RULES = {
  name: [{ required: true, message: '必填', type: 'error', trigger: 'blur' }],
  data: [{ required: true, message: '必填' }],
  type: [{ required: true, message: '必填' }],
  sensitive: [{ required: true, message: '必填' }],
};

const [countDown, handleCounter] = useCounter();
const userStore = useUserStore();
const router = useRouter();

const submiteRef = ref(null);
const files = ref([]);
const active = reactive({
  dialog: 'add',
});
const formData = ref({
  data: {
    name: '',
    desc: '',
    type: 'site',
    sensitive: false,
    ext: '',
    data: '',
  },
  raw: {
    id: null,
    name: '',
    desc: '',
    type: 'site',
    sensitive: false,
    ext: '',
    data: '',
  },
});
const asyncLoadingRadio = ref('load-more');
const historyList = ref([]);
const pagination = ref({
  defaultPageSize: 20,
  defaultCurrent: 1,
  total: 0,
  pageSize: 20,
  current: 1,
});

onMounted(() => {
  if (userStore.token) {
    getHistory();
  }
});

const loadMore = async () => {
  if (historyList.value.length >= pagination.value.total) asyncLoadingRadio.value = 'done';
  else {
    asyncLoadingRadio.value = 'loading';
    try {
      await getHistory();
    } catch (e) {
      console.log(e);
    } finally {
      asyncLoadingRadio.value = 'load-more';
    }
  }
};

const getHistory = async () => {
  try {
    const response = await fetchContentHistory({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
    });

    if (response.code === 0) {
      historyList.value = historyList.value.concat(response.data.list);
      pagination.value.total = response.data.total;
      pagination.value.current = pagination.value.current;
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    }
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const asyncLoading = computed(() => {
  if (asyncLoadingRadio.value === 'done') {
    return '没有更多数据了';
  }
  return asyncLoadingRadio.value;
});

const onReset = () => {
  const type = active.dialog;
  if (type === 'add') {
    formData.value.data = {
      name: '',
      desc: '',
      type: 'site',
      sensitive: false,
      ext: '',
      data: '',
    };
  } else if (type === 'edit') {
    const data = { ...formData.value.raw };
    const dataCopy = clone(data); // 重要
    delete dataCopy.id;
    delete dataCopy.audit;
    formData.value.data = dataCopy;
  }
};

const onSubmit = throttle(
  async ({ validateResult, firstError }) => {
    if (validateResult === true) {
      try {
        if (!userStore.token) {
          MessagePlugin.warning('请先登录');
          return;
        }

        if (formData.value.data.ext) {
          try {
            const parsedExt = JSON.parse(formData.value.data.ext);
            if (typeof parsedExt !== 'object' || parsedExt === null) {
              MessagePlugin.warning('扩展参数非标准JSON格式');
              return;
            }
          } catch {
            MessagePlugin.warning('扩展参数非标准JSON格式');
            return;
          }
        }

        let response;
        if (active.dialog === 'edit') {
          response = await putContent(formData.value.raw.id, formData.value.data);
        } else {
          response = await addContent(formData.value.data);
        }
        if (response.code === 0) {
          MessagePlugin.info('数据上传成功, 等待审核');

          pagination.value.current = 1;
          pagination.value.total = 0;
          historyList.value = [];
          getHistory();
        } else if (response.code === -2) {
          await userStore.logout();
          MessagePlugin.info('登录凭证过期, 重新登录');
        } else {
          MessagePlugin.error(response.msg);
        }
      } catch (err) {
        MessagePlugin.error(err);
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.warning(firstError);
    }
  },
  10000,
  {
    leading: true, // 节流开始前，默认true
    trailing: false, // 节流结束后，默认true
  },
); // 10s

const onEdit = async (item) => {
  active.dialog = 'edit';
  formData.value.raw = item;

  const dataCopy = clone(item); // 重要
  delete dataCopy.id;
  delete dataCopy.audit;

  formData.value.data = dataCopy;

  if (submiteRef.value) {
    nextTick(() => {
      submiteRef.value.scrollIntoView({ behavior: 'smooth' });
    });
  }
};

const requestMethod = (file) => {
  const fileData = new FormData();
  fileData.append('file', file.raw);

  return new Promise(async (resolve) => {
    try {
      const response = await upload(fileData);
      if (response.code === 0) {
        MessagePlugin.success('上传成功');
        formData.value.data.data = response.data.url;
        resolve({ status: 'success', response: { url: response.data.url } });
        handleCounter(30);
      } else {
        MessagePlugin.error('上传失败');
        resolve({ status: 'fail', error: response.msg });
      }
    } catch (err) {
      MessagePlugin.error('上传失败');
      resolve({ status: 'fail', error: err.message });
    }
  });
};

const handleDetail = (id) => {
  router.push({ name: 'HomeDetail', params: { id } });
};
</script>

<style lang="less" scoped>
.view-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  .content {
    width: 100%;

    .card-item {
      .tips {
        margin: var(--td-comp-margin-m) 0;
        padding: var(--td-pop-padding-m);
        border-style: dashed;
        border-radius: var(--td-radius-medium);
        border-width: 1px;
        border-color: var(--td-text-color-placeholder);

        .tip {
          color: var(--td-text-color-placeholder);
          font: var(--td-font-body-medium);
          font-weight: 500;
        }
      }

      .submit-type {
        margin: 0 0 var(--td-comp-margin-m) 0;
      }

      .ext-tip {
        color: var(--td-text-color-placeholder);
        font: var(--td-font-body-small);
        padding: var(--td-comp-paddingTB-xxs) 0;
      }

      .data-upload {
      }

      // :deep(.t-upload__dragger) {
      //   width: 100%;
      // }

      // :deep(.t-upload__single-display-text) {
      //   display: none;
      // }
    }

    .create {
      .title {
        margin: var(--td-comp-margin-m) 0;
        font-weight: 500;
      }

      .step-item {
        .use-title {
          span,
          a {
            font: var(--td-font-body-medium);
          }
        }

        .content {
          color: var(--td-text-color-placeholder);
          font: var(--td-font-body-small);
          padding: var(--td-comp-paddingTB-xxs) 0;
        }
      }
    }
  }
}
</style>
