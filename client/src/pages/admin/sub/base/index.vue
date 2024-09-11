<template>
  <div class="sub-base view-container">
    <div class="header operation-container card">
      <t-form :data="formData" :label-width="40" colon @submit="onSubmit" @reset="onReset">
        <t-row :gutter="[16, 16]">
          <t-col :xs="12" :sm="5">
            <t-form-item label="搜索" name="status">
              <t-input v-model="formData.email" clearable></t-input>
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
          <t-button theme="danger" @click="onConfirmBatchDeleteSub">批量删除</t-button>
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
          <t-link theme="primary" @click="onConfirmOpSub(slotProps)">授权</t-link>

          <t-popconfirm content="确认删除吗" @confirm="onConfirmDeleteSub(slotProps)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <t-dialog v-model:visible="isVisible.auth" header="授权" @confirm="onConfirmAuthSub">
      <t-input v-model="formData.allow_ips" placeholder="请输入新授权地址"></t-input>
    </t-dialog>
  </div>
</template>

<script setup lang="js">
import { MessagePlugin } from 'tdesign-vue-next';
import { RefreshIcon } from 'tdesign-icons-vue-next';
import { computed, onMounted, ref } from 'vue';

import { getList, delSubscribe, delBatchSubscribe, putCodeSubscribe } from '@/api/subscribe';
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
  { title: '用户名', colKey: 'username', width: 100 },
  { title: '邮箱', colKey: 'email', width: 150 },
  { title: "源码", colKey: 'code', width: 50 },
  { title: '地址', colKey: 'allow_ips', width: 200 },
  {
    align: 'left',
    fixed: 'right',
    width: 60,
    colKey: 'op',
    title: '操作',
  },
];

const formData = ref({ code: '', allow_ips: '', opid: 0, select: [] });
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

const isVisible = ref({
  auth: false,
});

const data = ref([]);

const dataLoading = ref(false);
const fetchData = async () => {
  dataLoading.value = true;
  try {
    const response = await getList({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      keyword: formData.value.email ? formData.value.email : null,
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

onMounted(() => {
  fetchData();
});

const onReset = () => {
  formData.value = { code: '', allow_ips: '', opid: 0, select: [] };
  onRefreshData();
};

const onSubmit = () => {
  onRefreshData();
};

const onRefreshData = async () => {
  await fetchData();
};

const onConfirmOpSub = (slot) => {
  formData.value.opid = slot.row.id;
  isVisible.value.auth = true;
};

const onConfirmDeleteSub = async (slot) => {
  try {
    const response = await delSubscribe(slot.row.id);
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

const onConfirmBatchDeleteSub = async () => {
  const { select } = formData.value;
  if (select.length === 0) {
    MessagePlugin.warning('请选择要删除的项');
    return;
  }
  try {
    const response = await delBatchSubscribe({ subIds: select });
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

const onConfirmAuthSub = async () => {
  try {
    const id = formData.value.opid;
    const response = await putCodeSubscribe(id, { allow_ips: formData.value.allow_ips });
    if (response.code === 0) {
      MessagePlugin.success('修改成功')
      isVisible.value.auth = false;
      fetchData();
    } else {
      MessagePlugin.warning('修改失败')
    };
  } catch (err) {
    MessagePlugin.error(`修改失败 ${err.message}`)
  }
};

const rehandlePageChange = async (curr) => {
  pagination.value.current = curr.current;
  pagination.value.pageSize = curr.pageSize;
  await fetchData();
};

const rehandleSelectChange = (val) => {
  formData.value.select = val;
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
