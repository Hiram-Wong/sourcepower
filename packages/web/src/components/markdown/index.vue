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

<style lang="css" scoped></style>
