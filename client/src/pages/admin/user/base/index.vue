<template>
  <div class="user-base view-container">
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
          <t-button theme="success" @click="isVisible.add = true">新建</t-button>
          <t-button theme="danger" @click="onConfirmBatchDeleteUser">批量删除</t-button>
          <t-button theme="default" @click="isVisible.yzm = true">验证码</t-button>
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
          <t-link theme="primary" @click="onConfirmOpUser(slotProps)">改密</t-link>

          <t-popconfirm content="确认删除吗" @confirm="onConfirmDeleteUser(slotProps)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <t-dialog v-model:visible="isVisible.passwd" header="改密" @confirm="onConfirmPasswdUser">
      <t-input v-model="formData.password" placeholder="请输入新密码" type="password"></t-input>
    </t-dialog>
    <t-dialog v-model:visible="isVisible.yzm" header="验证码" @confirm="onConfirmYzmUser">
      <t-input v-model="formData.email" placeholder="请输入邮箱"></t-input>
    </t-dialog>
    <t-dialog v-model:visible="isVisible.add" header="新增用户" @confirm="onConfirmAddUser">
      <t-space direction="vertical" style="width: calc(100% - 4px); margin-left: 2px;">
        <t-input label="昵称：" v-model="formData.username"></t-input>
        <t-input label="邮箱：" v-model="formData.email"></t-input>
        <t-input label="密码：" v-model="formData.password" type="password"></t-input>
        <t-select v-model="formData.role" label="权限：">
          <t-option value="user" label="user"></t-option>
          <t-option value="admin" label="admin"></t-option>
        </t-select>
      </t-space>
    </t-dialog>
  </div>
</template>

<script setup lang="js">
import { MessagePlugin } from 'tdesign-vue-next';
import { RefreshIcon } from 'tdesign-icons-vue-next';
import { computed, onMounted, ref } from 'vue';

import { addUser, getList, getYzm, delUser, delBatchUser, putPasswdUser } from '@/api/user';
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
  { title: '邮箱', colKey: 'email', width: 100 },
  { title: '权限', colKey: 'role', width: 50 },
  {
    align: 'left',
    fixed: 'right',
    width: 50,
    colKey: 'op',
    title: '操作',
  },
];

const formData = ref({ email: '', password: '', opid: 0, username: '', role: 'user', select: [] });
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
  passwd: false,
  add: false,
  yzm: false
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
  formData.value = { email: '', password: '', opid: 0, username: '', role: 'user', select: [] };
  onRefreshData();
};

const onSubmit = () => {
  onRefreshData();
};

const onRefreshData = async () => {
  await fetchData();
};

const onConfirmOpUser = (slot) => {
  formData.value.opid = slot.row.id;
  isVisible.value.passwd = true;
};

const onConfirmDeleteUser = async (slot) => {
  try {
    const response = await delUser(slot.row.id);
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

const onConfirmBatchDeleteUser = async () => {
  const { select } = formData.value;
  if (select.length === 0) {
    MessagePlugin.warning('请选择要删除的项');
    return;
  }
  try {
    const response = await delBatchUser({ userIds: select });
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

const onConfirmPasswdUser = async () => {
  try {
    const id = formData.value.opid;
    const response = await putPasswdUser(id, { password: formData.value.password });
    if (response.code === 0) {
      MessagePlugin.success('修改成功')
      isVisible.value.passwd = false;
    } else {
      MessagePlugin.warning('修改失败')
    };
  } catch (err) {
    MessagePlugin.error(`修改失败 ${err.message}`)
  }
};

const onConfirmYzmUser = async () => {
  try {
    const response = await getYzm({ email: formData.value.email });
    if (response.code === 0) {
      MessagePlugin.success({ 'close-btn': true, duration: 0, content: `验证码: ${response.data.code}` })
      formData.value.email = "";
      isVisible.value.yzm = false;
    } else {
      MessagePlugin.warning(`查询失败 ${response.msg}`)
    };
  } catch (err) {
    MessagePlugin.error(`查询失败 ${err.message}`)
  }
};

const onConfirmAddUser = async () => {
  try {
    const { username, password, email, role } = formData.value;
    if (!username || !password || !email || !role) {
      MessagePlugin.warning('所有参数均必填')
      return;
    }
    const response = await addUser({
      username,
      password,
      email,
      role
    });
    if (response.code === 0) {
      MessagePlugin.success('创建成功');
      formData.value.username = "";
      formData.value.password = "";
      formData.value.email = "";
      isVisible.value.add = false;
      fetchData();
    } else {
      MessagePlugin.warning('创建失败')
    };
  } catch (err) {
    MessagePlugin.error(`创建失败 ${err.message}`)
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