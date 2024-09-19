<template>
  <div class="system-link view-container">
    <div class="header operation-container card">
      <t-form :data="filterFormData" :label-width="40" colon @submit="onFilterSubmit" @reset="onFilterReset">
        <t-row :gutter="[16, 16]">
          <t-col :xs="12" :sm="5">
            <t-form-item label="名称" name="name">
              <t-input v-model="filterFormData.name" clearable></t-input>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="2">
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
        <t-form-item label="名称" name="name">
          <t-input v-model="formData.data.name"></t-input>
        </t-form-item>
        <t-form-item label="地址" name="url">
          <t-input v-model="formData.data.url"></t-input>
        </t-form-item>
        <t-form-item label="图标" name="logo">
          <t-input v-model="formData.data.logo"></t-input>
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" type="submit">提交</t-button>
          <t-button theme="default" type="reset">重置</t-button>
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

import { addFriendChain, fetchFriendChainList, delFriendChain, delBatchFriendChain, putFriendChain } from '@/api/friendchain';
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
  { title: '地址', colKey: 'url', width: 100 },
  { title: '图标', colKey: 'icon', width: 100 },
  {
    align: 'left',
    fixed: 'right',
    width: 50,
    colKey: 'op',
    title: '操作',
  },
];

const filterFormData = ref({ name: '' });
const formData = ref({
  data: { name: '', url: '', logo: '' },
  raw: { id: null, name: '', url: '', logo: '' }
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
  name: [{ required: true, message: '必填' }],
  url: [
    { required: true, message: '必填' },
    {
      url: {
        protocols: ['http', 'https'],
        require_protocol: true,
      },
      message: '请输入正确的地址',
    },
  ],
  logo: [
    { required: false, message: '选填' },
    {
      url: {
        protocols: ['http', 'https'],
        require_protocol: true,
      },
      message: '请输入正确的地址',
    },
  ],
};

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  dataLoading.value = true;
  try {
    const response = await fetchFriendChainList({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      keyword: filterFormData.value.name ? filterFormData.value.name : null,
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
  filterFormData.value = { name: '' };
  onRefreshData();
};

const onFilterSubmit = () => {
  onRefreshData();
};

const onRefreshData = async () => {
  active.tableSelect = [];
  await fetchData();
};

const onEditDetail = (slot) => {
  const data = slot.row;
  formData.value.raw = data;

  const dataCopy = clone(data); // 重要
  delete dataCopy.id;

  formData.value.data = dataCopy;
  onShowDialog('edit');
};

const onConfirmDelete = async (slot) => {
  try {
    const response = await delFriendChain(slot.row.id);
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
    const response = await delBatchFriendChain({ ids: select });
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
      if (type === 'add') response = await addFriendChain(formData.value.data);
      else if (type === 'edit') response = await putFriendChain(formData.value.raw.id, formData.value.data);
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
    formData.value.data = { name: '', url: '', logo: '' };
  } else if (type === 'edit') {
    const data = { ...formData.value.raw };
    const dataCopy = clone(data); // 重要
    delete dataCopy.id;
    formData.value.data = dataCopy;
  };
};

const onDialogClose = () => {
  formData.value = {
    data: { name: '', url: '', logo: '' },
    raw: { id: null, name: '', url: '', logo: '' }
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