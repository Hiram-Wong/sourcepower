<template>
  <div class="sub-content view-container">
    <div class="header operation-container card">
      <t-form :data="filterFormData" :label-width="50" colon @submit="onFilterSubmit" @reset="onFilterReset">
        <t-row :gutter="[16, 16]">
          <t-col :xs="12" :sm="4">
            <t-form-item label="敏感" name="name" clearable placeholder="默认全部">
              <t-select v-model="filterFormData.sensitive">
                <t-option value="sensitive" label="敏感"></t-option>
                <t-option value="nosensitive" label="非敏感"></t-option>
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="4">
            <t-form-item label="类型" name="name" clearable placeholder="默认全部">
              <t-select v-model="filterFormData.type">
                <t-option value="site" label="影视"></t-option>
                <t-option value="live" label="直播"></t-option>
                <t-option value="parse" label="解析"></t-option>
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="4">
            <t-form-item label="审核" name="name">
              <t-select v-model="filterFormData.audit" clearable placeholder="默认全部">
                <t-option :value=0 label="通过"></t-option>
                <t-option :value=-2 label="未通过"></t-option>
                <t-option :value=-1 label="待审核"></t-option>
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="4">
            <t-form-item label="创作者" name="creator">
              <t-select v-model="filterFormData.creator" filterable clearable placeholder="默认全部">
                <t-option v-for="item in creatorList" :key="item.id" :value="item.id" :label="item.username"></t-option>
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="4">
            <t-form-item label="名称" name="name">
              <t-input v-model="filterFormData.name" clearable></t-input>
            </t-form-item>
          </t-col>
          <!-- <t-col :xs="12" :sm="3">
            <t-form-item label="日期" name="name">
              <t-date-range-picker v-model="filterFormData.date" allow-input clearable @pick="onPick"
                @change="onChange" />
            </t-form-item>
          </t-col> -->
          <t-col :xs="12" :sm="4">
            <t-button theme="primary" type="submit">查询</t-button>
            <t-button theme="default" type="reset">重置</t-button>
          </t-col>
        </t-row>
      </t-form>
    </div>
    <div class="main table-container card">
      <div class="table-header">
        <div class="table-header-left">
          <t-button theme="success" @click="onShowDialog('add')">新增</t-button>
          <t-button theme="danger" @click="onConfirmBatchDelete">批量删除</t-button>
        </div>
        <div class="table-header-right">
          <t-button shape="circle" theme="default" @click="onRefreshData">
            <template #icon> <refresh-icon /></template>
          </t-button>
        </div>
      </div>
    </div>
    <t-table :data="data" :columns="COLUMNS" :row-key="rowKey" :vertical-align="verticalAlign" :hover="hover"
      :pagination="pagination" :loading="dataLoading" :header-affixed-top="headerAffixedTop"
      @select-change="rehandleSelectChange" @page-change="rehandlePageChange">
      <template #type="{ row }">
        <span v-if="row.type === 'site'">影视</span>
        <span v-else-if="row.type === 'live'">电视</span>
        <span v-else-if="row.type === 'parse'">解析</span>
      </template>
      <template #sensitive="{ row }">
        <t-tag v-if="row.sensitive === true" shape="round" theme="success">是</t-tag>
        <t-tag v-else shape="round" theme="danger">否</t-tag>
      </template>
      <template #audit="{ row }">
        <t-tag v-if="row.audit === 0" shape="round" theme="success">通过</t-tag>
        <t-tag v-else-if="row.audit === -2" shape="round" theme="danger">未通过</t-tag>
        <t-tag v-else-if="row.audit === -1" shape="round" theme="default">待审核</t-tag>
      </template>
      <template #op="slotProps">
        <t-space>
          <t-popconfirm content="确认审核同意吗" confirm-btn="通过" cancel-btn="驳回" @cancel="onConfirmAudit(slotProps, false)"
            @confirm="onConfirmAudit(slotProps, true)">
            <t-link theme="default">审核</t-link>
          </t-popconfirm>
          <t-link theme="primary" @click="onEditDetail(slotProps)">编辑</t-link>

          <t-popconfirm content="确认删除吗" @confirm="onConfirmDelete(slotProps)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <t-dialog v-model:visible="isVisible.dialog" :header="active.dialog === 'add' ? '新增' : '编辑'" :footer="null"
      @close="onDialogClose">
      <t-form :data="formData.data" :rules="FORM_DIALOG_RULES" :label-width="60" colon label-align="right"
        @submit="onDialogSubmit" @reset="onDialogReset" class="form-dialog">
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

        <t-form-item label="敏感" name="sensitive">
          <t-radio-group v-model="formData.data.sensitive" variant="default-filled">
            <t-radio-button :value="true">是</t-radio-button>
            <t-radio-button :value="false">否</t-radio-button>
          </t-radio-group>
          <t-popup content="涩涩和哎呦疼等均数据敏感资源">
            <info-circle-icon style="margin-left: 6px;" />
          </t-popup>
        </t-form-item>

        <t-form-item label="数据" name="data">
          <t-input v-model="formData.data.data" placeholder="直链则输入, 文件则上传"></t-input>
          <t-upload v-model="files" :size-limit="{ size: 1, unit: 'MB' }" :allow-upload-duplicate-file="true"
            :multiple="false" :request-method="requestMethod" theme="file"
            :style="{ marginLeft: 'var(--td-comp-margin-m)' }"></t-upload>
        </t-form-item>

        <t-form-item label="介绍" name="desc">
          <t-textarea v-model="formData.data.desc" placeholder="请输入介绍, 如域名、访问速度、质量、有无广告等"></t-textarea>
        </t-form-item>

        <t-form-item label="自定义" name="ext">
          <t-space direction="vertical" style="flex: 1;">
            <t-textarea v-model="formData.data.ext"></t-textarea>
            <p>解析需填写{type: 0|1} 0 标识 web 1;标识 json</p>
          </t-space>
        </t-form-item>

        <t-form-item>
          <t-space size="small">
            <t-button theme="primary" type="submit">提交</t-button>
            <t-button theme="default" variant="base" type="reset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="js">
import { MessagePlugin } from 'tdesign-vue-next';
import { RefreshIcon, InfoCircleIcon } from 'tdesign-icons-vue-next';
import { computed, onMounted, ref, reactive } from 'vue';
import _ from 'lodash';

import { addContent, fetchContentCreator, fetchContentList, delContent, delBatchContent, putContent } from '@/api/content';
import { upload } from '@/api/system';
import { prefix } from '@/config/global';
import { useSettingStore } from '@/store';

const store = useSettingStore();

const COLUMNS = [
  { colKey: 'row-select', type: 'multiple', width: 32, fixed: 'left' },
  {
    title: 'id',
    fixed: 'left',
    width: 50,
    ellipsis: true,
    align: 'left',
    colKey: 'id',
  },
  { title: '名称', colKey: 'name', width: 100 },
  { title: '用户', colKey: 'username', width: 80 },
  { title: '邮箱', colKey: 'email', width: 100 },
  { title: '类型', colKey: 'type', width: 50 },
  { title: '敏感', colKey: 'sensitive', width: 50 },
  { title: '审核', colKey: 'audit', width: 50 },
  {
    align: 'left',
    fixed: 'right',
    width: 80,
    colKey: 'op',
    title: '操作',
  },
];

const files = ref([]);
const filterFormData = ref({ name: '', sensitive: '', type: '', audit: null, date: [] });
const formData = ref({
  data: {
    name: '',
    desc: '',
    type: 'site',
    sensitive: false,
    ext: '',
    data: '',
    audit: 0
  },
  raw: {
    id: null,
    name: '',
    desc: '',
    type: 'site',
    sensitive: false,
    ext: '',
    data: '',
    audit: 0
  }
});
const creatorList = ref([]);
const rowKey = 'id';
const verticalAlign = 'top';
const hover = true;

const pagination = ref({
  defaultPageSize: 20,
  defaultCurrent: 1,
  total: 0,
  pageSize: 20,
  current: 1,
});

const isVisible = reactive({
  dialog: false,
});
const active = reactive({
  dialog: 'add',
  tableSelect: [],
})

const data = ref([]);

const dataLoading = ref(false);

const FORM_DIALOG_RULES = {
  name: [{ required: true, message: '必填', type: 'error', trigger: 'blur' }],
  data: [{ required: true, message: '必填' }],
  type: [{ required: true, message: '必填' }],
  sensitive: [{ required: true, message: '必填' }]
};

onMounted(() => {
  fetchData();
  getCreatorData();
});

const getCreatorData = async () => {
  try {
    const response = await fetchContentCreator();

    if (response.code === 0) {
      creatorList.value = response.data.list;
    } else {
      MessagePlugin.error(`fail: ${response.msg}`);
    };
  } catch (err) {
    console.log(err);
    MessagePlugin.error(`fail: ${err.message}`);
  }
}

const fetchData = async () => {
  dataLoading.value = true;
  try {
    const response = await fetchContentList({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      keyword: filterFormData.value.name,
      sensitive: filterFormData.value.sensitive,
      type: filterFormData.value.type,
      audit: filterFormData.value.audit,
      creator: filterFormData.value.creator,
    });
    data.value = response.data.list;
    pagination.value = {
      ...pagination.value,
      total: response.data.total,
    };
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

const onFilterReset = () => {
  filterFormData.value = { name: '', sensitive: '', type: '', audit: null, date: [] };
  onRefreshData();
};

const onFilterSubmit = () => {
  onRefreshData();
};

const onRefreshData = async () => {
  active.tableSelect = [];
  await fetchData();
};

const onConfirmAudit = async (slot, status) => {
  const id = slot.row.id;
  const index = slot.rowIndex;

  try {
    const response = await putContent(id, { audit: status ? 0 : -2 });
    if (response.code === 0) {
      data.value[index].audit = status ? 0 : -2;
      MessagePlugin.success('success');
    } else {
      MessagePlugin.warning(`fail: ${response.msg}`);
    }
  } catch (err) {
    MessagePlugin.error(`fail: ${err.message}`);
  }
};

const onEditDetail = (slot) => {
  const data = slot.row;
  formData.value.raw = data;

  const dataCopy = _.clone(data); // 重要
  delete dataCopy.id;

  formData.value.data = dataCopy;
  onShowDialog('edit');
};

const onConfirmDelete = async (slot) => {
  try {
    const response = await delContent(slot.row.id);
    if (response.code === 0) {
      data.value.splice(slot.rowIndex, 1);
      pagination.value.total -= 1;
      MessagePlugin.success('删除成功')
    } else {
      MessagePlugin.warning('删除失败')
    }
  } catch (err) {
    MessagePlugin.error(`删除失败 ${err.message}`)
  }
};

const onShowDialog = (type) => {
  active.dialog = type;
  isVisible.dialog = true;
};

const onConfirmBatchDelete = async () => {
  const select = active.tableSelect;
  if (select.length === 0) {
    MessagePlugin.warning('请选择要删除的项');
    return;
  }
  try {
    const response = await delBatchContent({ ids: select });
    if (response.code === 0) {
      pagination.value.total -= select.length;
      MessagePlugin.success('删除成功')
      fetchData();
    } else {
      MessagePlugin.warning('删除失败')
    }
  } catch (err) {
    MessagePlugin.error(`删除失败 ${err.message}`)
  }
};

const onDialogSubmit = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    const type = active.dialog;
    try {
      let response;
      if (type === 'add') response = await addContent(formData.value.data);
      else if (type === 'edit') response = await putContent(formData.value.raw.id, formData.value.data);
      if (response.code === 0) {
        MessagePlugin.success('success')
        isVisible.dialog = false;
        onRefreshData();
      } else {
        MessagePlugin.warning(`fail: ${response.msg}`)
      };
    } catch (err) {
      MessagePlugin.error(`fail: ${err.message}`)
    }
  } else {
    console.log('Errors: ', validateResult);
    MessagePlugin.warning(firstError);
  }
};

const onDialogReset = () => {
  const type = active.dialog;
  if (type === 'add') {
    formData.value.data = {
      name: '', desc: '', type: 'site', sensitive: false, ext: '', data: ''
    };
  } else if (type === 'edit') {
    const data = { ...formData.value.raw };
    const dataCopy = _.clone(data); // 重要
    delete dataCopy.id;
    formData.value.data = dataCopy;
  };
};

const onDialogClose = () => {
  formData.value = {
    data: {
      name: '',
      desc: '',
      type: 'site',
      sensitive: false,
      ext: '',
      data: ''
    },
    raw: {
      id: null,
      name: '',
      desc: '',
      type: 'site',
      sensitive: false,
      ext: '',
      data: ''
    }
  };
  isVisible.dialog = false;
  active.dialog = '';
};

const rehandlePageChange = async (curr) => {
  pagination.value.current = curr.current;
  pagination.value.pageSize = curr.pageSize;
  await fetchData();
};

const rehandleSelectChange = (val) => {
  active.tableSelect = val;
};

const headerAffixedTop = computed(
  () =>
  ({
    offsetTop: store.isUseTabsRouter ? 48 : 0,
    container: `.${prefix}-layout`,
  }), // TO BE FIXED
);

const requestMethod = (file) => {
  const fileData = new FormData();
  fileData.append('file', file.raw);

  return new Promise(async (resolve) => {
    try {
      const response = await upload(fileData);
      if (response.code === 0) {
        MessagePlugin.success('上传成功');
        formData.value.data = response.data.url;
        resolve({ status: 'success', response: { url: response.data.url } });
      } else {
        MessagePlugin.error('上传失败');
        resolve({ status: 'fail', error: response.msg });
      }
    } catch (err) {
      MessagePlugin.error('上传失败');
      resolve({ status: 'fail', error: err.message });
    }
  })
};
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .card {
    background-color: var(--td-bg-color-container);
    padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-xl);
    border-radius: var(--td-radius-medium);
  }

  .operation-container {}

  .table-container {
    margin-top: var(--td-comp-margin-xxl);

    .table-header {
      display: flex;
      justify-content: space-between;
    }
  }
}

.form-item-content {
  width: 100%;
}
</style>