import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: path.resolve(process.cwd(), "src/client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/client"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
