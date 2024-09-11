import { SendIcon, UserIcon, System2Icon } from "tdesign-icons-vue-next";
import { shallowRef } from "vue";

import Layout from "@/layouts/admin/index.vue";

export default [
  {
    path: "/admin/user",
    component: Layout,
    redirect: "/admin/user/base",
    name: "user",
    meta: {
      title: {
        zh_CN: "用户管理",
        en_US: "User",
      },
      icon: shallowRef(UserIcon),
      orderNo: 0,
      single: true,
    },
    children: [
      {
        path: "base",
        name: "UserBase",
        component: () => import("@/pages/admin/user/base/index.vue"),
        meta: {
          title: {
            zh_CN: "用户管理",
            en_US: "User",
          },
          roleCode: "admin",
        },
      },
    ],
  },
  {
    path: "/admin/sub",
    component: Layout,
    redirect: "/admin/sub/base",
    name: "subtitle",
    meta: {
      title: {
        zh_CN: "分发管理",
        en_US: "Subtitle",
      },
      icon: shallowRef(SendIcon),
      orderNo: 1,
    },
    children: [
      {
        path: "base",
        name: "SubtitleBase",
        component: () => import("@/pages/admin/sub/base/index.vue"),
        meta: {
          title: {
            zh_CN: "订阅管理",
            en_US: "Subtitle",
          },
          roleCode: "admin",
        },
      },
      {
        path: "content",
        name: "SubtitleContent",
        component: () => import("@/pages/admin/sub/content/index.vue"),
        meta: {
          title: {
            zh_CN: "内容管理",
            en_US: "Content",
          },
          roleCode: "admin",
        },
      },
      {
        path: "data",
        name: "SubtitleData",
        component: () => import("@/pages/admin/sub/data/index.vue"),
        meta: {
          title: {
            zh_CN: "数据管理",
            en_US: "Data",
          },
          roleCode: "admin",
        },
      },
    ],
  },
  {
    path: "/admin/system",
    component: Layout,
    redirect: "/admin/system/notice",
    name: "system",
    meta: {
      title: {
        zh_CN: "系统管理",
        en_US: "System",
      },
      icon: shallowRef(System2Icon),
      orderNo: 2,
    },
    children: [
      {
        path: "notice",
        name: "SystemNotice",
        component: () => import("@/pages/admin/system/notice/index.vue"),
        meta: {
          title: {
            zh_CN: "公告管理",
            en_US: "Notice",
          },
          roleCode: "admin",
        },
      },
      {
        path: "link",
        name: "SystemLink",
        component: () => import("@/pages/admin/system/link/index.vue"),
        meta: {
          title: {
            zh_CN: "友链管理",
            en_US: "Link",
          },
          roleCode: "admin",
        },
      },
    ],
  },
];
