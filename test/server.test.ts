import assert from "node:assert";
import test from "node:test";
import { parseApplicationsMD } from "../src/server/parser.js";

test("parse applications markdown content", async () => {
  try {
    const data = await parseApplicationsMD();
    assert.ok(Array.isArray(data), "Data is parsed into an array");
    if (data.length > 0) {
      const first = data[0];
      assert.ok(typeof first.num === "number", "num is a number");
      assert.ok(first.company, "company is defined");
      assert.ok(first.role, "role is defined");
      assert.ok(first.score, "score is defined");
      assert.ok(first.status, "status is defined");
    }
  } catch (error: any) {
    // If the folder is missing, we check that it throws the database not found error
    assert.match(error.message, /Applications file not found/);
  }
});
