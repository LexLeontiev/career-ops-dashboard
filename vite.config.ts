import { defineConfig } from "vite";
import path from "node:path";
import { parsePort } from "./src/server/port.js";

export function resolveApiProxyTarget(port = process.env.PORT): string {
  return `http://127.0.0.1:${parsePort(port)}`;
}

export default defineConfig({
  root: path.resolve(process.cwd(), "src/client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/client"),
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api/": resolveApiProxyTarget(),
    },
  },
});
