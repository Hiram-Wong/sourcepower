import { defineStore } from "pinia";

import router, { allRoutes, homeRoutes } from "@/router";
import { store } from "@/store";

function filterPermissionsRouters(routes, roles) {
  if (roles.includes("user")) roles = ["HomeIndex", "HomeDetail" ,"HomeSource", "HomeAbout", "HomeSubmit", "HomeDonate", "Login"];;
  const res = [];
  const removeRoutes = [];
  routes.forEach((route) => {
    const children = [];
    route.children?.forEach((childRouter) => {
      const roleCode = childRouter.meta?.roleCode || childRouter.name;
      if (roles.indexOf(roleCode) !== -1) {
        children.push(childRouter);
      } else {
        removeRoutes.push(childRouter);
      }
    });
    if (children.length > 0) {
      route.children = children;
      res.push(route);
    }
  });
  return { accessedRouters: res, removeRoutes };
}

export const usePermissionStore = defineStore("permission", {
  state: () => ({
    whiteListRouters: ["HomeIndex", "HomeSource", "HomeAbout", "HomeSubmit", "HomeDonate", "Login"],
    routers: [],
    removeRoutes: [],
  }),
  actions: {
    async initRoutes(roles) {
      let accessedRouters = [];

      let removeRoutes = [];
      // special token
      if (roles.includes("admin")) {
        accessedRouters = allRoutes;
      } else {
        const res = filterPermissionsRouters(allRoutes, roles);
        accessedRouters = res.accessedRouters.concat(homeRoutes);
        removeRoutes = res.removeRoutes;
      }

      // @ts-ignore
      this.routers = accessedRouters;
      // @ts-ignore
      this.removeRoutes = removeRoutes;

      // removeRoutes.forEach((item) => {
      //   if (router.hasRoute(item.name)) {
      //     router.removeRoute(item.name);
      //   }
      // });
    },
    restoreRoutes() {
      // this.removeRoutes.forEach((item) => {
      //   console.log(item)
      //   router.addRoute(item);
      // });
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
