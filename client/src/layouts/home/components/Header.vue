<template>
  <div class="header-container">
    <div class="header">
      <t-head-menu expand-type="popup" class="header" v-model="activeMenu" @change="changeHandler">
        <template #logo>
          <img class="logo" src="@/assets/logo.png" alt="logo" @click="logoHandle('index')">
        </template>

        <t-menu-item v-for="(item, index) in MENU_LIST" :key="index" :value="item.value">
          {{ item.label }}
        </t-menu-item>

        <template #operations>
          <div class="t-nav">
            <div class="t-menu-prefix">
              <t-button theme="default" shape="square" variant="text" @click="isVisible.menu = !isVisible.menu"
                class="mobile-navigation">
                <menu-fold-icon v-if="isVisible.menu" />
                <menu-unfold-icon v-else />
              </t-button>
              <t-drawer v-model:visible="isVisible.menu" attach="body" :footer="false" placement="left"
                class="mobile-sidebar">
                <ul class="t-menu-custom mobile-menu">
                  <t-menu-item v-for="(item, index) in MENU_LIST" :key="index" :value="item.value"
                    @click="isVisible.menu = false">
                    <div style="margin-left: 8px;">
                      <icon :name="item.icon" />
                      <span style="margin-left: 8px;">{{ item.label }}</span>
                    </div>
                  </t-menu-item>
                </ul>
              </t-drawer>
            </div>
          </div>
          <t-dropdown :min-column-width="120" trigger="click">
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item class="operations-dropdown-container-item" @click="handleNav('/login')"
                  v-if="!userStore.token">
                  <login-icon />前往登录
                </t-dropdown-item>

                <t-dropdown-item class="operations-dropdown-container-item" @click="handleNav('/admin')"
                  v-if="userStore.userInfo.roles.includes('admin')">
                  <work-icon />前往后台
                </t-dropdown-item>
                <t-dropdown-item class="operations-dropdown-container-item" @click="handleLogout"
                  v-if="userStore.token">
                  <poweroff-icon />退出登录
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
            <t-button class="header-user-btn" theme="default" variant="text">
              {{ userStore.token ? userStore.userInfo.name : '登录/注册' }}
            </t-button>
          </t-dropdown>
        </template>
      </t-head-menu>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Icon, LoginIcon, MenuFoldIcon, MenuUnfoldIcon, PoweroffIcon, WorkIcon } from 'tdesign-icons-vue-next';

import { getActive } from '@/router';
import { useUserStore } from '@/store';

const MENU_LIST = [{
  label: '首页',
  value: 'index',
  icon: 'home'
}, {
  label: '数据',
  value: 'source',
  icon: 'code-1'
}, {
  label: '投稿',
  value: 'submit',
  icon: 'article'
}, {
  label: '捐助',
  value: 'donate',
  icon: 'gift'
}, {
  label: '关于',
  value: 'about',
  icon: 'info-circle'
}]

const router = useRouter();
const userStore = useUserStore();

const active = computed(() => {
  const fullPath = getActive();
  const path = fullPath.split('/')[1];
  return path;
});

watch(() => active.value, (val) => {
  activeMenu.value = val;
})

const activeMenu = ref(active.value);

const isVisible = reactive({
  menu: false,
});

const logoHandle = (path) => {
  // activeMenu.value = path;
  changeHandler(path);
};

const changeHandler = (active) => {
  handleNav(`/${active}`);
};

const handleNav = (url) => {
  router.push(url);
};

const handleLogout = () => {
  router.push({
    path: '/login',
    query: { redirect: encodeURIComponent(router.currentRoute.value.fullPath) },
  });
  userStore.logout();
};
</script>

<style scoped lang="less">
.header-container {
  height: 100%;
  width: 100%;

  .t-nav {
    display: flex;
    align-items: center;

    .t-menu-prefix {
      display: none;
    }

    .t-menu-custom {
      display: flex;
      align-items: center;
    }
  }

  .header-user-btn {
    margin-left: var(--td-comp-margin-s);
    padding: 0 var(--td-comp-paddingLR-l);
  }

  :deep(.t-drawer--attach) {
    position: fixed;
    top: var(--td-comp-size-xxxl);
  }

  :deep(.t-drawer) {
    .t-drawer__content-wrapper--top {
      border-top: 1px solid var(--td-component-border);
    }
  }

  .logo {
    font-size: 28px;
    font-weight: 500;
    height: 32px;
    cursor: pointer;
  }

  .mobile-navigation,
  .header-user-btn {
    position: relative;
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--td-text-color-primary);
    border-radius: var(--td-radius-default);
    --ripple-color: var(--td-bg-color-container-active);
    height: var(--td-comp-size-m);
    line-height: var(--td-comp-size-m);
    padding: 0 var(--td-comp-paddingLR-l);
    justify-content: center;
  }

  @media (max-width: 750px) {
    .t-nav {
      display: flex;
      align-items: center;

      .t-menu-prefix {
        display: block;
      }

      .t-menu-custom {
        display: none;
      }
    }

    .header-user-btn {
      margin-left: var(--td-comp-margin-xxs);
      padding: 0 var(--td-comp-paddingLR-s);
    }

    :deep(ul.t-menu) {
      display: none;
    }

    :deep(.t-head-menu__inner) {
      justify-content: space-between;
    }
  }
}
</style>