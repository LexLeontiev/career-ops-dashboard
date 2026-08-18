import path from "node:path";
import { createApp } from "./app.js";
import { parsePort } from "./port.js";

export { parsePort } from "./port.js";

export function startServer(): void {
  const host = process.env.HOST?.trim() || "127.0.0.1";
  const port = parsePort(process.env.PORT);
  const staticDirectory =
    process.env.NODE_ENV === "production" ? path.resolve(process.cwd(), "dist/client") : false;
  createApp({ staticDirectory }).listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`);
  });
}

if (process.env.NODE_ENV !== "test") startServer();
