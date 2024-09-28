<template>
  <span v-html="markdownDom" class="markdown-body markdown-custom"></span>
</template>

<script setup lang="js">
import { watchEffect, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import MarkdownIt from 'markdown-it';
import markdownItHighlightjs from 'markdown-it-highlightjs';
import MarkdownItCodeCopy from 'markdown-it-code-copy';
import 'github-markdown-css';
import './index.less';

const props = defineProps({
  markdownText: {
    type: String,
    default: '',
  },
});

const markdownDom = ref('');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  },
})
  .use(markdownItHighlightjs)
  .use(MarkdownItCodeCopy, {
    buttonClass: 'md-btn',
    iconClass: 'md-icon-copy',
    onSuccess: () => {
      MessagePlugin.closeAll();
      MessagePlugin.success('复制成功');
    },
    onError: () => {
      MessagePlugin.closeAll();
      MessagePlugin.error('复制失败');
    },
  });

const handleMarkdown = () => {
  if (!props.markdownText) {
    return;
  }

  const html = md.render(props.markdownText);

  markdownDom.value = html;
};

watchEffect(() => {
  handleMarkdown();
});
</script>

<style lang="css" scoped>
.markdown-custom {
  background: transparent;
  color: var(--td-text-color-primary);
}

:deep(.md-icon-copy) {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 80% 80%;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMyAxMi40MzE2VjcuODEyNUMxMyA2LjI1OTIgMTQuMjU5MiA1IDE1LjgxMjUgNUg0MC4xODc1QzQxLjc0MDggNSA0MyA2LjI1OTIgNDMgNy44MTI1VjMyLjE4NzVDNDMgMzMuNzQwOCA0MS43NDA4IDM1IDQwLjE4NzUgMzVIMzUuNTE2MyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zMi4xODc1IDEzSDcuODEyNUM2LjI1OTIgMTMgNSAxNC4yNTkyIDUgMTUuODEyNVY0MC4xODc1QzUgNDEuNzQwOCA2LjI1OTIgNDMgNy44MTI1IDQzSDMyLjE4NzVDMzMuNzQwOCA0MyAzNSA0MS43NDA4IDM1IDQwLjE4NzVWMTUuODEyNUMzNSAxNC4yNTkyIDMzLjc0MDggMTMgMzIuMTg3NSAxM1oiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+);
}

:deep(.md-btn) {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px var(--td-border-level-2-color) solid;
  border-radius: var(--td-radius-default);
  margin: 0;
  padding: 0;
  transition: all 0.2s linear;

  &:hover {
    border-color: var(--td-brand-color-hover);
  }
}
</style>
