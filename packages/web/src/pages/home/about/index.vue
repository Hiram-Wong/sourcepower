<template>
  <div class="about-container view-container">
    <div class="content">
      <t-card title="关于本站" :bordered="false" class="card-item t-card-tag">
        <h2 style="margin-top: 0">Intro | 简介</h2>
        <p>「源动力」是一个为了消除信息差的不平等, 建立的开放式协作的聚集地。欢迎你加入贡献自己的智慧。</p>
        <p>我们的目标是为广大爱好者提供便捷、丰富的配置文件，让你能在各种软件上轻松搜索到心仪的内容。</p>
        <p>
          总之，作为和大家一样的爱好者，我们会努力为所有爱好者提供更优质、更完善的环境和服务，也感谢大家一直以来的支持和鼓励。
        </p>
        <h2>FAQ | 问答</h2>
        <p class="question">Q: 数据的来源是哪里?</p>
        <p class="answer">A: 所有数据均有广大网友提供，本站仅为集合展示。</p>
        <p class="question">Q: 数据适用于哪些软件?</p>
        <p class="question">A: 软件需支持 js、xbpq等数据格式, 本站以js为主。</p>
        <!-- <p class="question">Q: 捐助的资金将用向何处?</p>
        <p class="question">A: 所有捐助的资金将用于未来的发展，相关服务器和服务所需的支出。</p>
        <p class="question">Q: 需要合作/投资/帮手吗?</p>
        <p class="question">
          A: 需要，请以邮件联系我: <t-link href="mailto:hiram@catni.cn" target="_blank"> hiram@catni.cn </t-link>。
        </p> -->
        <h2>TEAM | 项目组</h2>
        <p>创始人: Hiram</p>
        <p>海阔视界小程序: LoyDgIk & α</p>
        <p>drpy技术支持: 道长</p>
        <p>xbpq(js版)技术支持: LoyDgIk & α</p>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="js"></script>

<style lang="less" scoped>
.view-container {
  .content {
    .card-item {
      h2 {
        font: var(--td-font-title-medium);
        color: var(--td-text-color-primary);
        margin-right: var(--td-comp-margin-l);
        word-break: break-all;
        text-align: left;
        margin: var(--td-comp-margin-s) 0;

        &::before {
          content: '';
          border-radius: var(--td-radius-medium);
          border-left: 3px solid var(--td-brand-color);
          margin-right: var(--td-comp-margin-s);
        }
      }

      p {
        padding: var(--td-comp-paddingTB-xxs) 0;
        margin: 0;
        line-height: 2;
      }
    }
  }
}
</style>
