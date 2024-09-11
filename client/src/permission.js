import "nprogress/nprogress.css"; // progress bar style

import NProgress from "nprogress"; // progress bar
import { MessagePlugin } from "tdesign-vue-next";

import router from "@/router";
import { getPermissionStore, useUserStore } from "@/store";

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const permissionStore = getPermissionStore();

  const { whiteListRouters } = permissionStore;

  const userStore = useUserStore();

  if (whiteListRouters.indexOf(to.name) !== -1) {
    next();
    NProgress.done();
    return;
  }

  if (userStore.token) {
    if (userStore.userInfo.roles && userStore.userInfo.roles.length > 0) {
      if (!router.hasRoute(to.name)) {
        next(`/`);
        return;
      }
      if (to.path.includes("/admin/")) {
        if (!userStore.userInfo.roles.includes("admin")) {
          next(`/`);
          return;
        } else next();
      } else next();
    } else {
      try {
        await userStore.getUserInfo();

        const { roles } = userStore.userInfo;

        await permissionStore.initRoutes(roles);

        if (router.hasRoute(to.name)) {
          next();
        } else {
          next(`/`);
        }
      } catch (error) {
        MessagePlugin.error(error.message);
        next({
          path: "/login",
          query: { redirect: encodeURIComponent(to.fullPath) },
        });
        NProgress.done();
      }
    }
  } else {
    next({
      path: "/login",
      query: { redirect: encodeURIComponent(to.fullPath) },
    });
    NProgress.done();
  }
});

router.afterEach((to) => {
  if (to.path === '/login') {
    const userStore = useUserStore();
    const permissionStore = getPermissionStore();

    userStore.logout();
    permissionStore.restoreRoutes();
  }
  NProgress.done();
});
