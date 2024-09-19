import { resolve } from "path";
import { defineConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { TDesignResolver } from "unplugin-vue-components/resolvers";
import vue from "@vitejs/plugin-vue";
import legacy from "@vitejs/plugin-legacy";
import vueDevTools from 'vite-plugin-vue-devtools';
import svgLoader from 'vite-svg-loader';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${resolve('src/style/variables.less')}";`,
        },
        math: 'strict',
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve("src"),
    },
  },
  build: {
    emptyOutDir: true, // 打包时先清空上一次构建生成的目录
    reportCompressedSize: false, // 关闭文件计算
    sourcemap: false, // 关闭生成map文件 可以达到缩小打包体积
    rollupOptions: {
      output: {
        entryFileNames: `assets/entry/[name][hash].js`, // 引入文件名的名称
        chunkFileNames: `assets/chunk/[name][hash].js`, // 包的入口文件名称
        assetFileNames: `assets/file/[name][hash].[ext]`, // 资源文件像 字体，图片等
        manualChunks(id) {
          if (id.includes('monaco-editor'))
            return 'monaco-editor_'; //代码分割为编辑器
          else if (id.includes('node_modules'))
            return 'vendor_'; //代码分割为第三方包
        },
      },
    },
  },
  plugins: [
    vue(),
    // vueDevTools(),
    svgLoader(),
    vueJsx(),
    AutoImport({
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
    }),
    Components({
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
    }),
    legacy({
      targets: ['defaults', 'ie >= 11', 'chrome 52'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all'
      ]
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 4000,
    strictPort: true, // 端口冲突自动分配端口
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000', // 后台接口域名
        changeOrigin: true, //是否跨域
        // pathRewrite: {
        //   '^/api': '',
        // },
      },
    },
  },
});
