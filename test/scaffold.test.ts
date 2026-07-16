import assert from "node:assert";
import test from "node:test";

test("environment check", () => {
  const env = process.env.NODE_ENV;
  assert.ok(env === "test" || env === undefined, "Environment is valid");
});
