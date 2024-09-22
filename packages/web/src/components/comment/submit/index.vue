<template>
  <div class="reply-box">
    <slot name="header"></slot>
    <div class="reply-box-main">
      <div class="content">
        <t-tabs theme="card" default-value="edit">
          <t-tab-panel value="edit" label="编辑">
            <div class="edit panel-content">
              <t-textarea
                v-model="textValue"
                placeholder="理性发言, 友善互动。"
                :autosize="{ minRows: 4, maxRows: 4 }"
                class="textarea"
              />
              <div class="tip">
                <span class="visual icon-md">
                  <svg
                    aria-hidden="true"
                    height="16"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="16"
                    data-view-component="true"
                    class="octicon octicon-markdown"
                  >
                    <path
                      d="M14.85 3c.63 0 1.15.52 1.14 1.15v7.7c0 .63-.51 1.15-1.15 1.15H1.15C.52 13 0 12.48 0 11.84V4.15C0 3.52.52 3 1.15 3ZM9 11V5H7L5.5 7 4 5H2v6h2V8l1.5 1.92L7 8v3Zm2.99.5L14.5 8H13V5h-2v3H9.5Z"
                    ></path>
                  </svg>
                </span>
                <span class="label">支持 markdown 语法</span>
              </div>
            </div>
          </t-tab-panel>
          <t-tab-panel value="preview" label="预览">
            <div class="preview panel-content">
              <render-markdown v-model:markdownText="textValue" v-if="textValue" />
              <p v-else>无内容预览</p>
            </div>
          </t-tab-panel>
        </t-tabs>
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

import RenderMarkdown from '@/components/markdown/index.vue';

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
      border-radius: var(--td-radius-medium);
      border: 1px solid var(--td-border-level-2-color);

      :deep(.t-tabs) {
        border-radius: var(--td-radius-medium);

        .t-tabs__nav-item.t-size-m {
          height: var(--td-comp-size-l);
          line-height: var(--td-comp-size-l);
        }

        .t-tabs__nav--card.t-tabs__nav-item.t-is-active {
          border-color: var(--td-component-stroke);
          border-bottom-color: transparent;
          border-radius: var(--td-radius-medium) var(--td-radius-medium) 0 0;
          color: var(--td-text-color-primary);
        }

        .t-tabs__nav--card.t-tabs__nav-item:not(.t-is-disabled):not(.t-is-active):hover {
          background-color: transparent;
          color: var(--td-text-color-primary);
        }

        .t-tabs__nav-item {
          border-color: transparent;
        }
      }

      .panel-content {
        padding: var(--td-pop-padding-l);
      }

      .edit {
        .textarea {
          :deep(textarea) {
            border-radius: var(--td-radius-medium);
          }
        }

        .tip {
          font-size: 12px;
          padding: var(--td-comp-paddingTB-xs) 0 0;
          color: var(--td-text-color-placeholder);
          display: flex;

          .visual {
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-right: var(--td-comp-margin-xs);
          }
        }
      }

      .preview {
        min-height: 100px;
      }
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
