import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
// import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
// https://www.npmjs.com/package/vite-plugin-wasm
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react(), wasm()],
  // worker: {
  //   // Not needed with vite-plugin-top-level-await >= 1.3.0
  //   // format: "es",
  //   plugins: [wasm(), topLevelAwait()],
  // },
});
