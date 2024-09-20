import Layout from "@/layouts/home/index.vue";

export default [
  {
    path: "/",
    name: "home",
    redirect: "/index",
    component: Layout,
    children: [
      {
        path: "index",
        name: "HomeIndex",
        component: () => import("@/pages/home/index/index.vue"),
      },
      {
        path: "source",
        name: "HomeSource",
        component: () => import("@/pages/home/source/index.vue"),
      },
      {
        path: "detail/:id",
        name: "HomeDetail",
        component: () => import("@/pages/home/source/detail.vue"),
      },
      {
        path: "submit",
        name: "HomeSubmit",
        component: () => import("@/pages/home/submit/index.vue"),
      },
      {
        path: "donate",
        name: "HomeDonate",
        component: () => import("@/pages/home/donate/index.vue"),
      },
      {
        path: "film",
        name: "HomeFilm",
        component: () => import("@/pages/home/film/index.vue"),
      },
      {
        path: "about",
        name: "HomeAbout",
        component: () => import("@/pages/home/about/index.vue"),
      },
    ],
  },
];
