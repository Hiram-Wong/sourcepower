<template>
  <div class="sub-data-container">
    <div class="header operation-container">
      <div class="operation-container__col operation-container__col--left">
        <t-button @click="onJsMake">编译</t-button>
      </div>
      <div class="operation-container__col operation-container__col--right">
      </div>
    </div>

    <div class="edit-container">
      <div class="edit-box" id="editBox" ref="editBoxRef"></div>
      <div class="edit-actions">
        <t-button theme="primary" variant="outline" @click="onEditReset">重置</t-button>
        <t-button theme="primary" @click="onEditSave">保存</t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import * as monaco from 'monaco-editor';
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import { getManage, putManage, makeManage } from '@/api/subscribe';

let form = ref({
  content: {
    source: '',
    text: ''
  }
});
const config = reactive({
  theme: 'vs',
  language: 'javascript',
  eol: monaco.editor.EndOfLineSequence.LF,
  wordWrap: 'on',
});
const editBoxRef = ref(null);

let edit;

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (['typescript', 'javascript'].includes(label)) {
      return new tsWorker();
    }
    return new EditorWorker();
  },
};

const fetchData = async () => {
  const res = await getManage();
  if (res.code === 0) {
    form.value.content.source = res.data;
    edit.setValue(res.data);
  }
};

const initEditor = () => {
  if (edit) edit.dispose();

  nextTick(() => {
    const editBox = editBoxRef.value;
    edit = monaco.editor.create(editBox, {
      theme: config.theme,
      value: form.value.content.text,
      automaticLayout: true,
      language: 'javascript',
      folding: true,
      roundedSelection: false,
      overviewRulerBorder: false,
      wordWrap: config.wordWrap,
      scrollBeyondLastLine: false,
      fixedOverflowWidgets: true
    });
    edit.onDidChangeModelContent(() => {
      if (edit) form.value.content.text = edit.getValue();
    });

    edit.getModel().pushEOL(config.eol);
  });
};

onMounted(() => {
  initEditor();
  fetchData();
})

onBeforeUnmount(() => {
  if (edit) edit.dispose();
});

const onEditReset = () => {
  try {
    edit.setValue(form.value.content.source);
    MessagePlugin.success("成功")
  } catch (err) {
    console.error(err);
    MessagePlugin.error("失败")
  }
};

const onEditSave = async () => {
  try {
    const res = edit.getValue();
    const response = await putManage(res);
    if (response.code === 0) {
      form.value.content.source = res;
      MessagePlugin.success("成功")
    } else {
      MessagePlugin.error(`失败: ${response.msg}`)
    }
  } catch (err) {
    console.error(err);
    MessagePlugin.error("失败")
  }
};

const onJsMake = async () => {
  try {
    const response = await makeManage();
    if (response.code === 0) {
      MessagePlugin.success("成功")
    } else {
      MessagePlugin.error(`失败: ${response.msg}`)
    }
  } catch (err) {
    console.error(err);
    MessagePlugin.error("失败")
  }
};
</script>

<style lang="less" scoped>
.sub-data-container {
  background-color: var(--td-bg-color-container);
  padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-xl);
  border-radius: var(--td-radius-medium);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .operation-container {
    display: flex;
    width: 100%;
    align-items: center;
    color: rgba(0, 0, 0, 0.9);
    box-sizing: border-box;
    justify-content: space-between;
    flex-direction: row;

    &__col {
      flex: auto;
      vertical-align: middle;
      text-align: right;
      font-size: 0;

      &:first-child {
        text-align: left;
      }
    }

    &__col--left {
      text-align: left;
    }

    &__col--right {
      text-align: right;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;

      .btn-icon {
        margin-left: 0;
      }
    }

    .btn-icon {
      border: none;
      background-color: transparent;
      box-sizing: border-box;
      color: rgba(0, 0, 0, .9);

      :deep(.t-button--variant-base.t-button--theme-primary:not(.t-is-disabled):not(.t-button--ghost)) {
        --ripple-color: transparent;
      }
    }
  }

  .edit-container {
    margin-top: var(--td-comp-margin-xxl);
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    .edit-box {
      height: 100%;
      width: 100%;
    }

    .edit-actions {
      margin-top: var(--td-comp-margin-s);
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
  }

  :deep(.t-upload__dragger) {
    width: 100%;
  }
}
</style>