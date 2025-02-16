// import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
import { defineConfig } from "vite";
import VueDevTools from "vite-plugin-vue-devtools";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(), // Этот плагин автоматически подхватывает пути (paths) из tsconfig.json, позволяя использовать алиасы без необходимости вручную указывать их в vite.config.js.
    VueDevTools(), // Этот плагин добавляет Vue Devtools в Vite-проект, что позволяет использовать инструменты разработчика Vue в браузере
    vue({
      template: {
        compilerOptions: {
          comments: false, // Это настройка Vue-компилятора, которая указывает не сохранять HTML-комментарии в итоговом скомпилированном коде.
        },
      },
    }),
  ],
  resolve: {
    alias: {
      // "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
