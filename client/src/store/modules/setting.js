import keys from "lodash/keys";
import { defineStore } from "pinia";

import STYLE_CONFIG from "@/config/style";
import { store } from "@/store";

const state = {
  ...STYLE_CONFIG,
};

export const useSettingStore = defineStore("setting", {
  state: () => state,
  getters: {
    showSidebar: (state) => state.layout !== 'top',
    showSidebarLogo: (state) => state.layout === 'side',
    showHeaderLogo: (state) => state.layout !== 'side',
    displayMode: (state) => {
      if (state.mode === "auto") {
        const media = window.matchMedia("(prefers-color-scheme:dark)");
        if (media.matches) {
          return "dark";
        }
        return "light";
      }
      return state.mode;
    },
  },
  actions: {
    async changeMode(mode) {
      let theme = mode;

      if (mode === "auto") {
        theme = this.getMediaColor();
      }
      const isDarkMode = theme === "dark";

      document.documentElement.setAttribute(
        "theme-mode",
        isDarkMode ? "dark" : ""
      );
    },
    async changeSideMode(mode) {
      const isDarkMode = mode === "dark";

      document.documentElement.setAttribute(
        "side-mode",
        isDarkMode ? "dark" : ""
      );
    },
    getMediaColor() {
      const media = window.matchMedia("(prefers-color-scheme:dark)");

      if (media.matches) {
        return "dark";
      }
      return "light";
    },
    updateConfig(payload) {
      for (const key in payload) {
        if (payload[key] !== undefined) {
          this[key] = payload[key];
        }
        if (key === "mode") {
          this.changeMode(payload[key]);
        }
      }
    },
  },
  persist: {
    pick: [...keys(STYLE_CONFIG)],
  },
});

export function getSettingStore() {
  return useSettingStore(store);
}
