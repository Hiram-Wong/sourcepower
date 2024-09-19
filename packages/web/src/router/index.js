import uniq from "lodash/uniq";
import { createRouter, createWebHistory } from "vue-router";

// 导入homepage相关固定路由
const homepageModules = import.meta.glob("./modules/**/homepage.js", {
  eager: true,
});

const adminpageModules = import.meta.glob("./modules/**/adminpage.js", {
  eager: true,
});

// 导入modules非homepage相关固定路由
const fixedModules = import.meta.glob("./modules/**/!(homepage|adminpage).js", {
  eager: true,
});

// 其他固定路由
const defaultRouterList = [
  {
    path: '/admin',
    redirect: '/admin/sub',
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/login/index.vue"),
  }
];
// 存放固定路由
export const homepageRouterList = mapModuleRouterList(homepageModules);
export const adminpageRouterList = mapModuleRouterList(adminpageModules);
export const fixedRouterList = mapModuleRouterList(fixedModules);

export const allRoutes = [
  ...homepageRouterList,
  ...adminpageRouterList,
  ...fixedRouterList,
  ...defaultRouterList,
];

export const homeRoutes = [
  ...homepageRouterList,
  ...fixedRouterList,
  ...defaultRouterList,
];

// 固定路由模块转换为路由
export function mapModuleRouterList(modules) {
  const routerList = [];
  Object.keys(modules).forEach((key) => {
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

export const getRoutesExpanded = () => {
  const expandedRoutes = [];

  fixedRouterList.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child) => {
          expandedRoutes.push(item.path);
          expandedRoutes.push(`${item.path}/${child.path}`);
        });
    }
  });
  return uniq(expandedRoutes);
};

export const getActive = (maxLevel = 3) => {
  // 非组件内调用必须通过Router实例获取当前路由
  const route = router.currentRoute.value;

  if (!route.path) {
    return "";
  }

  return route.path
    .split("/")
    .filter((_item, index) => index <= maxLevel && index > 0)
    .map((item) => `/${item}`)
    .join("");
};

const router = createRouter({
  history: createWebHistory("/"),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: "#app",
      top: 0,
      behavior: "smooth",
    };
  },
});

export default router;
