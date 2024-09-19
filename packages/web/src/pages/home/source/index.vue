<template>
  <div class="source view-container">
    <div class="content">
      <t-card title="数据漩涡" :bordered="false" class="card-item t-card-tag">
        <t-form :data="filterFormData" :label-width="50" @submit="onSubmit" @reset="onReset" class="header-operation">
          <t-row :gutter="[16, 16]">
            <t-col :xs="12" :sm="4">
              <t-form-item label="类型" name="type">
                <t-select v-model="filterFormData.type" clearable placeholder="默认全部">
                  <t-option value="site" label="影视"></t-option>
                  <t-option value="live" label="电视"></t-option>
                  <t-option value="parse" label="解析"></t-option>
                </t-select>
              </t-form-item>
            </t-col>
            <t-col :xs="12" :sm="4">
              <t-form-item label="敏感" name="sensitive">
                <t-select v-model="filterFormData.sensitive" clearable placeholder="默认全部">
                  <t-option value="sensitive" label="敏感"></t-option>
                  <t-option value="nosensitive" label="非敏感"></t-option>
                </t-select>
              </t-form-item>
            </t-col>
            <t-col :xs="12" :sm="4">
              <t-form-item label="创作者" name="creator">
                <t-select v-model="filterFormData.creator" filterable clearable placeholder="默认全部">
                  <t-option
                    v-for="item in creatorList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.username"
                  ></t-option>
                </t-select>
              </t-form-item>
            </t-col>
            <t-col :xs="12" :sm="4">
              <t-form-item label="名称" name="name">
                <t-input v-model="filterFormData.keyword" clearable></t-input>
              </t-form-item>
            </t-col>
            <t-col :xs="12" :sm="4">
              <t-space size="small">
                <t-button theme="primary" type="submit">查询</t-button>
                <t-button theme="default" type="reset">重置</t-button>
              </t-space>
            </t-col>
          </t-row>
        </t-form>

        <template v-if="!dataLoading">
          <template v-if="pagination.total > 0">
            <div class="list-card-items">
              <t-row :gutter="[16, 16]">
                <t-col v-for="(item, index) in dataList" :key="index" :xs="6" :sm="4">
                  <t-card theme="poster2" :bordered="false" class="list-card-item" @click="handleDetail(item.id)">
                    <template #title>
                      <p class="list-card-title">{{ item.name }}</p>
                    </template>
                    <template #subtitle>
                      <div class="list-card-tag-date">发布于 {{ formatDate(item.created_at) }}</div>
                    </template>
                    <template #description>
                      <div class="list-card-tag-list">
                        <div class="type">
                          <span v-if="item.type === 'site'">影视</span>
                          <span v-else-if="item.type === 'live'">电视</span>
                          <span v-else-if="item.type === 'parse'">解析</span>
                        </div>
                        <div class="sensitive">{{ item.sensitive ? '敏感' : '常规' }}</div>
                      </div>
                    </template>
                    <template #footer>
                      <div class="list-card-item-post-user">
                        <strong>{{ item.username }}</strong>
                        <span class="provide">提供</span>
                      </div>
                    </template>
                  </t-card>
                </t-col>
              </t-row>
            </div>
            <div class="list-card-pagination">
              <t-pagination
                v-model="pagination.current"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :show-page-size="false"
                theme="simple"
                @change="onCurrentChange"
              />
            </div>
          </template>
          <template v-else>
            <t-empty />
          </template>
        </template>

        <div v-else class="list-card-loading">
          <t-loading style="display: flex" />
        </div>
      </t-card>

      <t-card title="创作榜单" :bordered="false" class="card-item t-card-tag" v-if="rankList.length > 0">
        <t-list stripe>
          <t-list-item>
            <div class="list-card-rank-item rank-header">
              <span class="index">排名</span>
              <span class="name">创作者</span>
            </div>
            <template #action>数量</template>
          </t-list-item>
          <t-list-item v-for="(item, index) in rankList" :key="item.id" class="list-card-rank-item">
            <div class="list-card-rank-item">
              <span class="index" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
              <span class="name">
                <t-link :href="`mailto:${item.email}`" target="_blank">
                  {{ item.username }}
                </t-link>
              </span>
            </div>
            <template #action>
              <span class="count">{{ item.count }}</span>
            </template>
          </t-list-item>
        </t-list>
      </t-card>
    </div>
  </div>
</template>

<script lang="js" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { fetchContentAll, fetchContentCreator, fetchContentRank } from '@/api/content';
import { formatDate } from '@/utils/tool';

const router = useRouter();

const pagination = ref({ current: 1, pageSize: 12, total: 0 });

const dataList = ref([]);
const rankList = ref([]);
const creatorList = ref([]);
const dataLoading = ref(true);

const filterFormData = ref({
  type: '',
  sensitive: '',
  keyword: '',
  creator: '',
});

const getData = async (page, limit) => {
  try {
    const response = await fetchContentAll({
      ...filterFormData.value,
      page,
      limit,
    });

    if (response.code === 0) {
      dataList.value = response.data.list;
      pagination.value = {
        ...pagination.value,
        total: response.data.total,
      };
    } else {
      MessagePlugin.error(`fail: ${response.msg}`);
    }
  } catch (e) {
    console.log(e);
    MessagePlugin.error(`fail: ${err.message}`);
  } finally {
    dataLoading.value = false;
  }
};

const getCreatorData = async () => {
  try {
    const response = await fetchContentCreator();

    if (response.code === 0) {
      creatorList.value = response.data.list;
    } else {
      MessagePlugin.error(`fail: ${response.msg}`);
    }
  } catch (err) {
    console.log(err);
    MessagePlugin.error(`fail: ${err.message}`);
  }
};

const getRankData = async () => {
  try {
    const response = await fetchContentRank();

    if (response.code === 0) {
      rankList.value = response.data.list;
    } else {
      MessagePlugin.error(`fail: ${response.msg}`);
    }
  } catch (err) {
    console.log(err);
    MessagePlugin.error(`fail: ${err.message}`);
  }
};

onMounted(() => {
  getData(1, 12);
  getCreatorData();
  getRankData();
});

const onSubmit = async () => {
  pagination.value.current = 1;
  pagination.value.total = 0;
  dataLoading.value = false;
  await getData(1, 12);
};

const onReset = async () => {
  pagination.value.current = 1;
  pagination.value.total = 0;
  dataLoading.value = false;
  filterFormData.value = {
    type: '',
    sensitive: '',
    keyword: '',
    creator: '',
  };
  await getData(1, 12);
};

const onCurrentChange = async (context) => {
  pagination.value.current = context.current;

  await getData(context.current, context.pageSize);
};

const handleDetail = (id) => {
  router.push({ name: 'HomeDetail', params: { id } });
};
</script>

<style lang="less" scoped>
.view-container {
  .content {
    .card-item {
      .header-operation {
        margin: var(--td-comp-margin-m) 0;

        .search-input {
          width: 360px;
        }
      }

      .list-card-item {
        background-color: var(--td-bg-color-secondarycontainer);
        cursor: pointer;

        :deep(.t-card__header) {
          padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-xl) 0;
          display: block;

          &::before {
            display: none;
          }

          &::after {
            display: none;
          }
        }

        :deep(.t-card__header-wrapper) {
          display: block;
        }

        :deep(.t-card__description) {
          margin: 0;
        }

        :deep(.t-card__body) {
          padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-xl);
        }

        :deep(.t-card__footer) {
          padding: 0 var(--td-comp-paddingLR-xl) var(--td-comp-paddingTB-l);
        }

        .list-card-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .list-card-tag-list {
          background-color: var(--td-bg-color-container-active);
          font: var(--td-font-body-small);
          display: flex;
          border-radius: var(--td-radius-small);
          margin-top: var(--td-comp-margin-xs);
          width: fit-content;

          .type {
            background-color: var(--td-bg-color-component-hover);
            border-radius: var(--td-radius-small);
            padding: 0 var(--td-comp-paddingTB-xs);
          }

          .sensitive {
            border-radius: var(--td-bg-color-component-disabled);
            padding: 0 var(--td-comp-paddingTB-xs);
          }
        }

        .list-card-item-desc {
          font: var(--td-font-body-small);
          font-weight: 500;
          height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .list-card-item-post-user {
          font-size: 12px;
          display: flex;
          align-items: center;

          strong {
            max-width: 70px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 var(--td-comp-paddingLR-xs) 0 0;
          }

          .provide {
            color: var(--td-text-color-placeholder);
          }
        }

        .list-card-tag-date {
          font-size: 10px;
          line-height: 12px;
          font-weight: 500;
        }
      }

      .list-card-pagination {
        margin-top: var(--td-comp-margin-m);

        :deep(.t-pagination__btn-prev),
        :deep(.t-pagination__btn-next),
        :deep(.t-pagination__jump) {
          margin: 0;
        }

        :deep(.t-pagination__jump) {
          margin: 0 var(--td-comp-margin-xs);
          gap: var(--td-comp-margin-s);
        }
      }

      .list-card-rank-item {
        .index {
          width: 50px;
          text-align: center;
          display: inline-block;
        }

        .rank-1 {
          color: #d44f52;
        }

        .rank-2 {
          color: #e28c4f;
        }

        .rank-3 {
          color: #c49956;
        }

        .name {
          margin-left: var(--td-comp-margin-xxxxl);
        }
      }

      :deep(.t-list-item__action) {
        .count {
          color: var(--td-text-color-placeholder);
        }
      }
    }
  }
}
</style>
