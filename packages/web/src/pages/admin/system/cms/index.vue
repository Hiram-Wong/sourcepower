<template>
  <div class="system-link view-container">
    <div class="header operation-container"></div>

    <div class="main-container card">
      <t-form :data="formData" :label-width="40" colon @submit="submitData">
        <t-row :gutter="[16, 16]">
          <t-col :xs="12" :sm="5">
            <t-form-item label="接口" name="api">
              <t-input v-model="formData.api" clearable></t-input>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="2">
            <t-button theme="primary" type="submit">保存</t-button>
            <!-- <t-button theme="default" type="reset">重置</t-button> -->
          </t-col>
        </t-row>
      </t-form>
    </div>
  </div>
</template>

<script lang="js" setup>
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { putCmsApi, fetchCmsApi } from '@/api/cms';

const formData = ref({
  api: '',
});
const dataLoading = ref(false);

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  dataLoading.value = true;
  try {
    const response = await fetchCmsApi();
    if (response.code === 0) {
      formData.value.api = response.data;
    } else {
      MessagePlugin.error(`获取数据失败:${response.msg}`);
    }
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

const submitData = async () => {
  dataLoading.value = true;
  try {
    const response = await putCmsApi({ value: formData.value.api });
    if (response.code === 0) {
      MessagePlugin.success(`success`);
    } else {
      MessagePlugin.error(`fail:${response.msg}`);
    }
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
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

  .operation-container {
  }

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
