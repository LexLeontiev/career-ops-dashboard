import assert from "node:assert/strict";
import { once } from "node:events";
import path from "node:path";
import { createApp } from "../src/server/app.ts";
import { resolveCareerOpsPaths } from "../src/server/config.ts";

const paths = resolveCareerOpsPaths("test/fixtures/career-ops");
const server = createApp({
  paths,
  staticDirectory: path.resolve("dist/client"),
}).listen(0, "127.0.0.1");

try {
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address === "object", "Expected a TCP server address");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const applicationsResponse = await fetch(`${baseUrl}/api/applications`);
  assert.equal(applicationsResponse.status, 200);
  assert.match(await applicationsResponse.text(), /Acme Labs/);

  const indexResponse = await fetch(`${baseUrl}/`);
  assert.equal(indexResponse.status, 200);
  assert.match(await indexResponse.text(), /<div id="root">/);
} finally {
  if (server.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

console.log("Production smoke passed.");
