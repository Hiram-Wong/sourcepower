<template>
  <div class="reply-box">
    <slot name="header"></slot>
    <div class="reply-box-main">
      <div class="content">
        <Editor :value="textValue" :plugins="plugins" :locale="zhHans" @change="handleChange" class="editer" />
        <!-- <t-textarea v-model="textValue" placeholder="理性发言, 友善互动。" :autosize="{ minRows: 3, maxRows: 5 }" />
        <div class="tip">支持 markdown 语法</div> -->
      </div>
    </div>
    <div class="reply-box-footer">
      <div class="left"></div>
      <div class="right">
        <t-button theme="default" @click="handleSubmit">评论</t-button>
      </div>
    </div>
  </div>
</template>

<script lang="js" setup>
import { ref, watch } from 'vue';

import 'bytemd/dist/index.css';
import { Editor, Viewer } from '@bytemd/vue-next';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import breaks from '@bytemd/plugin-breaks';
import footnotes from '@bytemd/plugin-footnotes';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import zhHans from 'bytemd/locales/zh_Hans.json';

const plugins = [breaks(), highlight(), footnotes(), frontmatter(), gfm(), mediumZoom(), gemoji()];

const emits = defineEmits(['update:modelValue', 'submit']);

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const textValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    textValue.value = val;
  },
);

watch(
  () => textValue.value,
  (val) => {
    emits('update:modelValue', val);
  },
);

const handleSubmit = () => {
  emits('submit', textValue.value);
};

const handleChange = (val) => {
  textValue.value = val;
};
</script>

<style lang="less" scoped>
.reply-box {
  .reply-box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .right {
      .close-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--td-comp-size-xs);
        height: var(--td-comp-size-xs);
        color: var(--td-text-color-primary);
        border-radius: var(--td-radius-default);
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--td-bg-color-container);
        }
      }
    }
  }

  .reply-box-main {
    margin-top: var(--td-comp-margin-xs);

    .content {
      .editer {
        border-radius: var(--td-radius-medium);
        overflow: hidden;

        :deep(.bytemd) {
          height: 223px;

          .bytemd-toolbar-right {
            display: none;
          }
        }
      }

      &:is(:focus, :focus-within) {
        border-color: var(--td-brand-color);
        box-shadow: 0 0 0 1px var(--td-brand-color-focus);
      }

      :deep(textarea) {
        border-color: transparent;
        box-shadow: none;
      }
    }

    .tip {
      font-size: 12px;
      padding: 6px 10px;
      border-top: 1px dashed var(--td-border-level-2-color);
      color: var(--td-text-color-placeholder);
    }
  }

  .reply-box-footer {
    margin-top: var(--td-comp-margin-m);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
