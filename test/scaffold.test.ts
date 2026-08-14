import { expect, test } from "vitest";

test("environment check", () => {
  const env = process.env.NODE_ENV;
  expect(env === "test" || env === undefined, "Environment is valid").toBeTruthy();
});
