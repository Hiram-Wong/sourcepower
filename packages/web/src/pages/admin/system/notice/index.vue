<template>
  <div class="notice view-container">
    <div class="header operation-container">
    </div>

    <div class="main-container">
      <Editor v-model="formData.value" :readonly="formData.readonly" :minHeight="formData.minHeight" />
      <t-button block @click="submitData" class="btn">提交</t-button>
    </div>
  </div>
</template>

<script lang="js" setup>
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import Editor from "@/components/edit/index.vue";
import { putNotice, fetchNotice } from '@/api/system';

const formData = ref({
  value: '',
  readonly: false,
  minHeight: 300
});
const dataLoading = ref(false);

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  dataLoading.value = true;
  try {
    const response = await fetchNotice();
    if (response.code === 0) {
      formData.value.value = response.data;
    } else {
      MessagePlugin.error(`获取数据失败:${response.msg}`)
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
    console.log(formData.value.value )

    console.log({ value: formData.value.value })
    const response = await putNotice({ value: formData.value.value });
    if (response.code === 0) {
      MessagePlugin.success(`success`)
    } else {
      MessagePlugin.error(`fail:${response.msg}`)
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
  background-color: var(--td-bg-color-container);
  padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-xl);
  border-radius: var(--td-radius-medium);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .main-container {
    .btn {
      margin-top: var(--td-comp-margin-m);
    }
  }
}
</style>