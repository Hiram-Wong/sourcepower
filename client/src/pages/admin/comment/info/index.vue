<template>
  <div class="comment-info view-container">
    <div class="header operation-container card">
      <t-form :data="filterFormData" :label-width="40" colon @submit="onFilterSubmit" @reset="onFilterReset">
        <t-row :gutter="[16, 16]">
          <t-col :xs="12" :sm="4">
            <t-form-item label="邮箱" name="email">
              <t-input v-model="filterFormData.email" clearable></t-input>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="4">
            <t-form-item label="项目" name="project">
              <t-input v-model="filterFormData.project" clearable></t-input>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="4">
            <t-form-item label="内容" name="content">
              <t-input v-model="filterFormData.content" clearable></t-input>
            </t-form-item>
          </t-col>
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
      <template #op="slotProps">
        <t-space>
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
        <t-form-item label="内容" name="content">
          <t-textarea v-model="formData.data.content" placeholder="理性发言, 友善互动。" :autosize="{ minRows: 3, maxRows: 5 }" />
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
import { RefreshIcon } from 'tdesign-icons-vue-next';
import { computed, onMounted, ref, reactive } from 'vue';
import clone from 'lodash/clone';

import { fetchCommentList, addComment, delComment, delBatchComment, putComment } from '@/api/comment';
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
  { title: '用户名', colKey: 'username', width: 50 },
  { title: '邮箱', colKey: 'email', width: 100 },
  { title: '项目', colKey: 'project', width: 100 },
  { title: "内容", colKey: 'content', width: 200 },
  {
    align: 'left',
    fixed: 'right',
    width: 60,
    colKey: 'op',
    title: '操作',
  },
];

const filterFormData = ref({ project: '', email: '', content: '' });
const formData = ref({
  data: { content: '' },
  raw: { content: '' }
});
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
  tableSelect: []
})
const data = ref([]);
const dataLoading = ref(false);

const FORM_DIALOG_RULES = {
  content: [{ required: true, message: '必填', type: 'error', trigger: 'blur' }]
};

onMounted(() => {
  fetchData();
});


const fetchData = async () => {
  dataLoading.value = true;
  try {
    const response = await fetchCommentList({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      email: filterFormData.value.email,
      project: filterFormData.value.project,
      content: filterFormData.value.content,
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
  filterFormData.value = { email: '', content: '', email: '' };
  onRefreshData();
};

const onFilterSubmit = () => {
  onRefreshData();
};

const onRefreshData = async () => {
  active.tableSelect = [];
  await fetchData();
};

const onConfirmDelete = async (slot) => {
  try {
    const response = await delComment(slot.row.id);
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

const onEditDetail = (slot) => {
  const data = slot.row;
  formData.value.raw = data;

  const dataCopy = clone(data); // 重要
  delete dataCopy.id;

  formData.value.data = dataCopy;
  onShowDialog('edit');
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
    const response = await delBatchComment({ ids: select });
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
    };

    try {
      let response;
      if (type === 'add') response = await addComment(formData.value.data);
      else if (type === 'edit') response = await putComment(formData.value.raw.id, formData.value.data);
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
      content: ''
    };
  } else if (type === 'edit') {
    const data = { ...formData.value.raw };
    const dataCopy = clone(data); // 重要
    delete dataCopy.id;
    formData.value.data = dataCopy;
  };
};

const onDialogClose = () => {
  formData.value = {
    data: {
      content: ''
    },
    raw: {
      id: null,
      content: ''
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
