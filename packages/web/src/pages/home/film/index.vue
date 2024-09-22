<template>
  <div class="about-container view-container">
    <div class="content">
      <t-alert theme="info" message="希望你仅追求能看, 请勿相信任何广告!" close class="alert-item" />

      <t-card title="浅看一下" :bordered="false" class="card-item t-card-tag">
        <div class="player">
          <div class="loader" v-if="!active.playing">
            <div class="bg">
              <div class="ui-abstergo">
                <img
                  src="data:image/svg+xml,%3c?xml%20version='1.0'%20standalone='no'?%3e%3c!DOCTYPE%20svg%20PUBLIC%20'-//W3C//DTD%20SVG%201.1//EN'%20'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3csvg%20t='1713394912880'%20class='icon'%20viewBox='0%200%201024%201024'%20version='1.1'%20xmlns='http://www.w3.org/2000/svg'%20p-id='10127'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20width='32'%20height='32'%3e%3cpath%20d='M464%20496H272c-17.6%200-32-14.4-32-32s14.4-32%2032-32h192c17.6%200%2032%2014.4%2032%2032s-14.4%2032-32%2032z%20m-96%20224c-17.6%200-32-14.4-32-32V464c0-17.6%2014.4-32%2032-32s32%2014.4%2032%2032v224c0%2017.6-14.4%2032-32%2032z%20m288%200c-12.8%200-24-8-28.8-19.2l-96-224c-6.4-16%200-35.2%2016-41.6%2016-6.4%2035.2%200%2041.6%2017.6L656%20608l67.2-155.2c6.4-16%2025.6-24%2041.6-17.6%2016%206.4%2024%2025.6%2016%2041.6l-96%20224C680%20712%20668.8%20720%20656%20720z%20m192%20208H176c-52.8%200-96-43.2-96-96V320c0-52.8%2043.2-96%2096-96h672c52.8%200%2096%2043.2%2096%2096v512c0%2052.8-43.2%2096-96%2096zM176%20288c-17.6%200-32%2014.4-32%2032v512c0%2017.6%2014.4%2032%2032%2032h672c17.6%200%2032-14.4%2032-32V320c0-17.6-14.4-32-32-32H176z%20m272%200c-8%200-16-3.2-22.4-9.6l-160-160c-12.8-12.8-12.8-32%200-44.8%2012.8-12.8%2032-12.8%2044.8%200l160%20160c12.8%2012.8%2012.8%2032%200%2044.8-6.4%206.4-14.4%209.6-22.4%209.6z%20m128%200c-8%200-16-3.2-22.4-9.6-12.8-12.8-12.8-32%200-44.8l160-160c12.8-12.8%2032-12.8%2044.8%200%2012.8%2012.8%2012.8%2032%200%2044.8l-160%20160C592%20284.8%20584%20288%20576%20288z'%20fill='%23ffffff'%20p-id='10128'%3e%3c/path%3e%3c/svg%3e"
                  width="60"
                />
                <div class="ui-text" data-v-a9d66c48="">
                  今天看点啥
                  <div class="ui-dot" data-v-a9d66c48=""></div>
                  <div class="ui-dot" data-v-a9d66c48=""></div>
                  <div class="ui-dot" data-v-a9d66c48=""></div>
                </div>
              </div>
            </div>
          </div>
          <PlayerView :option="videoOption" v-else style="border-radius: var(--td-radius-medium); overflow: hidden" />
        </div>
      </t-card>

      <t-card title="纵享丝滑" :bordered="false" class="card-item t-card-tag">
        <div class="search-box">
          <t-input v-model="searchText" clearable placeholder="搜索一下 · 即刻观看" class="search-input"></t-input>
          <t-button class="search-button" @click="handleSearch"> 搜索 </t-button>
        </div>
        <div class="search-res" v-if="searchText">
          <t-tabs v-model="active.tab">
            <t-tab-panel value="search" label="搜索结果">
              <div class="panel-content">
                <t-table
                  row-key="index"
                  :data="table"
                  :columns="COLUMNS"
                  :pagination="pagination"
                  :loading="active.tableLoading"
                  @change="onCurrentChange"
                >
                  <template #op="slotProps">
                    <t-space>
                      <t-link theme="primary" @click="handleDetail(slotProps.row.vod_id)">查看</t-link>
                    </t-space>
                  </template>
                </t-table>
                <t-divider style="margin: var(--td-comp-margin-s) 0" />
                <p>
                  <span>数据由</span>
                  <t-link theme="primary" href="https://huaweiba.live/">华为吧</t-link>
                  <span>提供</span>
                </p>
              </div>
            </t-tab-panel>
            <t-tab-panel value="detail" label="视频详情">
              <div class="panel-content">
                <template v-if="detail?.vod_id">
                  <div class="check_top">
                    <div class="img-box">
                      <t-image fit="cover" :src="detail.vod_pic" :style="{ width: '100%', height: '142px' }" />
                    </div>
                    <div class="intro">
                      <p class="title">{{ detail.vod_name }}</p>
                      <p class="info">
                        <span v-if="detail.vod_area">{{ detail.vod_area }}</span>
                        <span v-if="detail.vod_year"> · {{ detail.vod_year }}</span>
                        <span v-if="detail.type_name"> · {{ detail.type_name }}</span>
                      </p>
                      <p class="content" v-html="detail.vod_content"></p>
                    </div>
                  </div>
                  <div class="list">
                    <div class="box-anthology-header">
                      <div class="left">
                        <h4 class="box-anthology-title">选集</h4>
                        <div class="box-anthology-line">
                          <t-dropdown placement="bottom" :max-height="250">
                            <t-button size="small" theme="default" variant="text" auto-width>
                              <span class="title">线路</span>
                              <template #suffix>
                                <chevron-down-icon size="16" />
                              </template>
                            </t-button>
                            <t-dropdown-menu>
                              <t-dropdown-item
                                v-for="(_, key, index) in detail.season_list"
                                :key="index"
                                :value="key"
                                @click="(options) => switchLineEvent(options.value)"
                              >
                                <span :class="[key === active.flimSource ? 'active' : '']">{{ key }}</span>
                              </t-dropdown-item>
                            </t-dropdown-menu>
                          </t-dropdown>
                        </div>
                      </div>
                      <div class="right">
                        <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
                          <order-descending-icon v-if="active.reverseOrder" size="1.2em" />
                          <order-ascending-icon v-else size="1.2em" />
                        </div>
                      </div>
                    </div>
                    <div class="listbox">
                      <div class="tag-container">
                        <div
                          v-for="(item, index) in detail.season_list[active.flimSource]"
                          :key="item"
                          :class="['mainVideo-num', item === active.filmIndex ? 'mainVideo-selected' : '']"
                          @click="changeEvent(item)"
                        >
                          <t-tooltip :content="formatName(item)">
                            <div class="mainVideo_inner">
                              {{
                                formatReverseOrder(
                                  active.reverseOrder,
                                  index,
                                  detail.season_list[active.flimSource].length,
                                )
                              }}
                              <div class="playing"></div>
                            </div>
                          </t-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <t-divider style="margin: var(--td-comp-margin-s) 0" />
                  <p>
                    <span>数据由</span>
                    <t-link theme="primary" href="https://huaweiba.live/">华为吧</t-link>
                    <span>提供</span>
                  </p>
                </template>
                <t-empty v-else />
              </div>
            </t-tab-panel>
          </t-tabs>
        </div>
      </t-card>

      <t-card title="今日热播" :bordered="false" class="card-item t-card-tag">
        <div class="hot-box">
          <t-tabs v-model="active.hotSource" @change="changeHotEvent" style="margin-top: -18px">
            <t-tab-panel :value="item.key" :label="item.name" v-for="item in hotOption" :key="item.key">
              <div class="hot-content">
                <div v-if="hot.length !== 0" class="hot-data">
                  <div
                    v-for="(item, index) in hot"
                    :key="item.vod_id"
                    class="rax-view-v2 hot-item"
                    @click="hotSearchEvent(item.vod_name)"
                  >
                    <div class="normal-view" :class="[index in [0, 1, 2] ? `color-${index + 1}` : '']">
                      <div class="normal-index">{{ index + 1 }}</div>
                      <div class="normal-title no-warp">{{ item.vod_name }}</div>
                      <div class="normal-tip">{{ item.vod_hot }}</div>
                    </div>
                  </div>
                  <t-divider style="margin: var(--td-comp-margin-s) 0" />
                  <p>
                    <span>数据由</span>
                    <t-link theme="primary" href="https://www.ky.live">ky.live</t-link>
                    <span>提供</span>
                  </p>
                </div>
                <div v-else class="empty">
                  <t-empty />
                </div>
              </div>
            </t-tab-panel>
          </t-tabs>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, reactive, onMounted, useTemplateRef, nextTick } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ChevronDownIcon, OrderDescendingIcon, OrderAscendingIcon } from 'tdesign-icons-vue-next';
import moment from 'moment';

import { fetchDetail, fetchSearchList, fetchHot } from '@/api/cms';
import { formatSeason, formatReverseOrder, formatName, formatIndex, formatVideoType } from '@/utils/cms';

import PlayerView from '@/components/player/index.vue';

const COLUMNS = [
  {
    colKey: 'vod_name',
    title: '名称',
  },
  {
    align: 'center',
    colKey: 'type_name',
    title: '类型',
    width: 100,
  },
  {
    align: 'center',
    fixed: 'right',
    width: 60,
    colKey: 'op',
    title: '操作',
  },
];

const pagination = ref({
  defaultPageSize: 20,
  defaultCurrent: 1,
  total: 0,
  pageSize: 20,
  current: 1,
  showJumper: true,
  theme: 'simple',
  showPageSize: false,
});
const iframeRef = useTemplateRef('iframeRef');
const iframeUrl = ref('about:blank');
const table = ref([]);
const hot = ref([]);
const detail = ref({});
const searchText = ref('');
const active = reactive({
  tab: 'search',
  reverseOrder: true,
  flimSource: '',
  filmIndex: '',
  tableLoading: false,
  playing: false,
  hotSource: 0,
});
const videoOption = ref({
  url: '',
  type: 'm3u8',
});
const hotOption = reactive([
  {
    key: 0,
    name: '全端',
  },
  {
    key: 1,
    name: '爱奇艺',
  },
  {
    key: 2,
    name: '腾讯',
  },
  {
    key: 3,
    name: '优酷',
  },
  {
    key: 4,
    name: '芒果',
  },
]);

onMounted(() => {
  getHotList();
});

const getSearchList = async (kw, page) => {
  active.tableLoading = true;
  try {
    const response = await fetchSearchList({
      keyword: kw,
      page,
    });

    if (response.code === 0) {
      table.value = response.data.list;
      pagination.value.total = response.data.total;
      active.tab = 'search';
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    }
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  } finally {
    active.tableLoading = false;
  }
};

const getDetail = async (id) => {
  try {
    const response = await fetchDetail(id);

    if (response.code === 0) {
      detail.value = response.data;
      active.tab = 'detail';
    } else {
      MessagePlugin.error(`fail ${response.msg}`);
    }
  } catch (err) {
    MessagePlugin.error(`fail ${err.message}`);
  }
};

const getHotList = async (retryCount = 1) => {
  try {
    const retryLimit = 4; // 重试次数 实际为 3 次
    const date = moment().subtract(retryCount, 'days');
    const dateFormat = date.format('YYYY-MM-DD');

    const response = await fetchHot('ky', {
      date: dateFormat,
      type: 2,
      plat: active.hotSource,
    });
    const queryHotList = response.data;

    if (queryHotList.length > 0) {
      hot.value = queryHotList;
    } else {
      if (retryCount < retryLimit) {
        await getHotList(retryCount + 1); // 递归请求
      }
    }
  } catch (err) {
    MessagePlugin.error(`error:${err}`);
    console.error(err);
  }
};

const handleSearch = async () => {
  const kw = searchText.value;
  const page = pagination.value.current;

  await getSearchList(kw, page);
};

const handleDetail = async (id) => {
  await getDetail(id);

  const formatData = formatSeason(detail.value);
  detail.value.season_list = formatData;
  active.flimSource = Object.keys(formatData)[0];
};

const onCurrentChange = async (context) => {
  pagination.value.current = context.pagination.current;

  await handleSearch();
};

// 选集排序
const reverseOrderEvent = () => {
  active.reverseOrder = !active.reverseOrder;
  if (active.reverseOrder) {
    detail.value.season_list = reverseOrderHelper(true, detail.value.season_list);
  } else {
    detail.value.season_list = reverseOrderHelper(false, detail.value.season_list);
  }
};

const switchLineEvent = (id) => {
  active.flimSource = id;
};

const dictDeepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

const reverseOrderHelper = (action, data) => {
  const newData = dictDeepClone(data);

  if (action) {
    console.log('[film_common][reverseOrderHelper]正序');
  } else {
    console.log('[film_common][reverseOrderHelper]倒序');
    Object.keys(newData).forEach((key) => newData[key].reverse());
  }
  return newData;
};

const changeEvent = async (item) => {
  active.playing = false;

  const { url, index } = formatIndex(item);

  const videoType = await formatVideoType(url);

  if (videoType !== 'unknown') {
    videoOption.value = {
      url,
      type: videoType,
    };
    active.playing = true;
  }

  active.filmIndex = item;
};

const changeHotEvent = async () => {
  hot.value = [];
  await getHotList();
};

const hotSearchEvent = async (val) => {
  searchText.value = val;
  pagination.value.current = 1;
  await handleSearch();
};
</script>

<style scoped lang="less">
.view-container {
  .content {
    .alert-item {
      margin-bottom: var(--td-comp-margin-m);
    }

    .player {
      width: 100%;
      height: 350px;
      border-radius: var(--td-radius-medium);
      background: #000;
      position: relative;
      .loader {
        width: 100%;
        height: 100%;
        border-radius: var(--td-radius-medium);
        background-image: url(@/assets/film/zmbg.webp);
        background-repeat: no-repeat;
        background-size: 100% 100%;
        .bg {
          border-radius: var(--td-radius-medium);
          width: 100%;
          height: 100%;
          background: #000000b3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .ui-abstergo {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            row-gap: 30px;
            scale: 1;
            .ui-text {
              color: var(--td-font-white-1);
              font-family: Menlo, sans-serif;
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: baseline;
              -ms-flex-align: baseline;
              align-items: baseline;
              -webkit-column-gap: 3px;
              -moz-column-gap: 3px;
              column-gap: 3px;

              @keyframes dots {
                0% {
                  background-color: var(--td-font-white-2);
                }

                30% {
                  background-color: var(--td-font-white-1);
                }
                70%,
                100% {
                  background-color: var(--td-font-white-3);
                }
              }
              .ui-dot {
                content: '';
                display: block;
                width: 3px;
                height: 3px;
                -webkit-animation: dots 2s infinite linear;
                animation: dots 2s infinite linear;
                -webkit-animation-delay: 0.2s;
                animation-delay: 0.2s;
                background-color: var(--td-font-white-1);
                & + .ui-dot {
                  margin-left: 3px;
                }
                &:nth-child(2) {
                  -webkit-animation-delay: 0.4s;
                  animation-delay: 0.4s;
                }
                &:nth-child(3) {
                  -webkit-animation-delay: 0.6s;
                  animation-delay: 0.6s;
                }
              }
            }
          }
        }
      }
    }
    @media only screen and (max-width: 768px) {
      .player {
        height: 250px;
      }
    }

    .search-box {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-align-items: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -webkit-transition: all 0.3s;
      transition: all 0.3s;
      width: 100%;

      background-color: var(--td-bg-color-secondarycontainer);
      border-radius: var(--td-radius-medium);
      padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
      display: flex;
      align-items: center;

      .search-input {
        :deep(.t-input) {
          border-color: transparent;
          background-color: transparent;
        }

        :deep(.t-input--focused) {
          border-color: transparent;
          box-shadow: none;
        }
      }

      .search-button {
        min-width: 60px;
        width: 60px;
      }
    }

    .panel-content {
      margin-top: var(--td-comp-margin-xs);

      .check_top {
        display: flex;
        height: 142px;
        flex-direction: row;
        justify-content: space-between;

        .img-box {
          width: 18%;
          height: 142px;
          display: flex;
          align-items: center;
          border-radius: var(--td-radius-medium);
          overflow: hidden;
        }

        .intro {
          width: 82%;
          padding-left: var(--td-comp-paddingLR-l);
          .title {
            font-size: 20px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .info {
            margin-top: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .content {
            margin-top: 5px;
            line-height: 23px;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        @media only screen and (max-width: 768px) {
          .img-box {
            width: 29%;
          }
          .intro {
            width: 71%;
          }
        }
      }
      .list {
        .box-anthology-header {
          margin-top: var(--td-comp-margin-m);
          font-size: 16px;
          line-height: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--td-text-color-primary);

          .left {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: flex-end;

            .mg-left {
              margin-left: var(--td-comp-margin-xs);
            }

            .box-anthology-title {
              white-space: nowrap;
              position: relative;
              font-size: 18px;
              line-height: 25px;
              font-weight: 600;
            }

            .box-anthology-analyze,
            .box-anthology-line {
              :deep(.t-button) {
                padding: 0;
              }

              :deep(.t-button:not(.t-is-disabled):not(.t-button--ghost)) {
                --ripple-color: transparent;
              }

              :deep(.t-button--variant-text) {
                color: var(--td-text-color-secondary);

                .t-button__suffix {
                  margin-left: var(--td-comp-margin-xxs);
                }

                .t-button__text {
                  &:before {
                    content: '';
                    width: 1px;
                    margin: 0 var(--td-comp-margin-xs);
                    background: linear-gradient(180deg, transparent, var(--td-border-level-1-color), transparent);
                  }
                }

                &:hover,
                &:focus-visible {
                  background-color: transparent !important;
                  border-color: transparent !important;
                  color: var(--td-brand-color);
                }
              }
            }
          }

          .right {
            .box-anthology-reverse-order {
              cursor: pointer;
            }
          }
        }

        .listbox {
          overflow: hidden;

          .tag-container {
            display: flex;
            flex-wrap: wrap;
            padding-top: 10px;

            .mainVideo-num {
              position: relative;
              width: 41px;
              font-size: 18px;
              height: 41px;
              line-height: 41px;
              border-radius: 8px;
              text-align: center;
              cursor: pointer;
              margin-bottom: 4px;
              margin-right: 4px;
              box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);

              &:hover {
                background-image: linear-gradient(var(--td-brand-color-2), var(--td-brand-color-3));
              }

              &:before {
                content: '';
                display: block;
                position: absolute;
                top: 1px;
                left: 1px;
                right: 1px;
                bottom: 1px;
                border-radius: 8px;
                background-color: var(--td-bg-container);
                z-index: 2;
              }

              .mainVideo_inner {
                position: absolute;
                top: 1px;
                left: 1px;
                right: 1px;
                bottom: 1px;
                border-radius: 8px;
                z-index: 3;
                overflow: hidden;
                background-image: linear-gradient(hsla(0, 0%, 100%, 0.04), hsla(0, 0%, 100%, 0.06));

                .playing {
                  display: none;
                  min-width: 10px;
                  height: 8px;
                  background: url(@/assets/film/playon-green.gif) no-repeat;
                }
              }
            }

            .mainVideo-selected {
              color: var(--td-brand-color);
              background-image: linear-gradient(hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.06));

              .playing {
                display: inline-block !important;
                position: absolute;
                left: 6px;
                bottom: 6px;
              }
            }
          }
        }
      }
      :deep(.t-table__pagination) {
        margin-top: var(--td-comp-margin-m);
        padding: 0;

        .t-pagination__btn-prev,
        .t-pagination__btn-next,
        .t-pagination__jump {
          margin: 0;
        }

        .t-pagination__jump {
          margin: 0 var(--td-comp-margin-xs);
          gap: var(--td-comp-margin-s);
        }
      }
    }

    .hot-box {
      .hot-nav {
        margin-bottom: 10px;

        .nav-item {
          margin-right: 10px;
          cursor: pointer;
        }

        .nav-item-active {
          font-size: 1.2em;
          font-weight: 700;
          color: var(--td-brand-color-active);
        }
      }

      .hot-content {
        margin-top: var(--td-comp-margin-s);

        .hot-data {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          flex-wrap: wrap;

          .rax-view-v2 {
            width: 50%;
          }

          .hot-item {
            .normal-view {
              display: flex;
              padding-left: 5px;
              cursor: pointer;

              .normal-index {
                flex: 0.15;
              }

              .normal-title {
                flex: 0.8;
                word-break: break-all;
                display: -webkit-box;
                text-overflow: ellipsis;
                overflow: hidden;
              }

              .normal-tip {
                font-weight: 700;
              }
            }

            .color-1 {
              color: #f7534f;
            }

            .color-2 {
              color: #fa7b32;
            }

            .color-3 {
              color: #ffc63f;
            }

            &:hover {
              border-radius: 5px;
              background-color: var(--td-bg-color-component-hover);
            }
          }
        }

        @media only screen and (max-width: 768px) {
          .hot-data {
            flex-direction: column;

            .rax-view-v2 {
              width: 100%;
            }
            .hot-item {
              .normal-view {
                padding: 0 var(--td-comp-paddingLR-m);
              }
            }
          }
        }
      }
    }
  }

  :deep(.t-tabs__nav-container) {
    &.t-is-top::after {
      background-color: transparent;
    }
  }

  :deep(.t-loading__overlay) {
    border-radius: var(--td-radius-medium);
  }

  :deep(.active) {
    color: var(--td-brand-color);
  }
}
</style>
