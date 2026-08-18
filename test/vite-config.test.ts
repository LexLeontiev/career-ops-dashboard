import { afterEach, describe, expect, test, vi } from "vitest";

const originalPort = process.env.PORT;

afterEach(() => {
  vi.unstubAllEnvs();
  if (originalPort === undefined) delete process.env.PORT;
  else process.env.PORT = originalPort;
  vi.resetModules();
});

async function loadProxyTarget(port?: string): Promise<unknown> {
  if (port === undefined) delete process.env.PORT;
  else vi.stubEnv("PORT", port);
  const { default: config } = await import("../vite.config.js");
  if (typeof config === "function") throw new TypeError("Expected an object Vite config");
  return config.server?.proxy?.["/api/"];
}

describe("Vite API proxy configuration", () => {
  test("uses the documented custom API PORT while retaining loopback", async () => {
    await expect(loadProxyTarget("3002")).resolves.toBe("http://127.0.0.1:3002");
  });

  test("defaults the API proxy to port 3001", async () => {
    await expect(loadProxyTarget()).resolves.toBe("http://127.0.0.1:3001");
  });
});
