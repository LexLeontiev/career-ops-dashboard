import { expect, test } from "vitest";
import { parseApplicationsMD } from "../src/server/parser.js";

test("parse applications markdown content", async () => {
  try {
    const data = await parseApplicationsMD();
    expect(Array.isArray(data), "Data is parsed into an array").toBeTruthy();
    if (data.length > 0) {
      const first = data[0];
      expect(typeof first.num === "number", "num is a number").toBeTruthy();
      expect(first.company, "company is defined").toBeTruthy();
      expect(first.role, "role is defined").toBeTruthy();
      expect(first.score, "score is defined").toBeTruthy();
      expect(first.status, "status is defined").toBeTruthy();
    }
  } catch (error: any) {
    // If the folder is missing, we check that it throws the database not found error
    expect(error.message).toMatch(/Applications file not found/);
  }
});
