<template>
  <div class="load">
    <div v-if="formData.total > formData.current" @click="handleLoadMore" class="load-item">
      <template v-if="active.load">
        <t-loading size="small" text="正在加载中，请稍等..."></t-loading>
      </template>
      <template v-else>
        <span class="active">点击加载更多</span>
      </template>
    </div>
  </div>
</template>

<script lang="js" setup>
import { reactive, ref, watch } from 'vue';

const emits = defineEmits(["load"]);

const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
  current: {
    type: Number,
    default: 0,
  },
});

const formData = ref({
  total: props.total,
  current: props.current,
});

const active = reactive({
  load: false,
});

watch(
  () => props.total,
  (val) => {
    formData.value.total = val;
  },
);

watch(
  () => props.current,
  (val) => {
    formData.value.current = val;
  },
);

const handleLoadMore = async () => {
  if (!active.load) {
    active.load = true;
    try {
      await emits('load');
    } catch (error) {
      console.error('Error during load event:', error);
    } finally {
      active.load = false;
    }
  }
};
</script>

<style lang="less" scoped>
.load {
  .load-item {
    text-align: center;
    line-height: var(--td-line-height-body-medium);
  }

  .active {
    cursor: pointer;
  }
}
</style>