import { describe, expect, test } from "vitest";
import { getCareerOpsPaths, resolveCareerOpsPaths } from "../src/server/config.js";

describe("career-ops path resolution", () => {
  test("resolves a relative root against the supplied working directory", () => {
    expect(resolveCareerOpsPaths("./relative-root", "/workspace/dashboard").root)
      .toBe("/workspace/dashboard/relative-root");
  });

  test("prefers a configured career-ops root", () => {
    expect(getCareerOpsPaths({ CAREER_OPS_ROOT: "/tmp/custom" }, "/workspace/dashboard").root)
      .toBe("/tmp/custom");
  });

  test("defaults to the adjacent career-ops directory", () => {
    expect(getCareerOpsPaths({}, "/workspace/dashboard").root)
      .toBe("/workspace/career-ops");
  });
});
