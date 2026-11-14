import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

// The widget ships as one script the EPL page can include:
//   <div id="angel-stream" data-api="https://api.example"></div>
//   <script src=".../angel-stream.js"></script>
export default defineConfig({
  plugins: [preact()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "AngelStream",
      formats: ["iife"],
      fileName: () => "angel-stream.js",
    },
    cssCodeSplit: false,
  },
});
