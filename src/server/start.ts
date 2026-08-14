import path from "node:path";
import { createApp } from "./app.js";

export function parsePort(value: string | undefined): number {
  const port = value === undefined ? 3001 : Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

export function startServer(): void {
  const host = process.env.HOST?.trim() || "127.0.0.1";
  const port = parsePort(process.env.PORT);
  const staticDirectory =
    process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), "dist/client")
      : false;
  createApp({ staticDirectory }).listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`);
  });
}

if (process.env.NODE_ENV !== "test") startServer();
