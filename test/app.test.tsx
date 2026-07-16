import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import App from "../src/client/App.js";

test("renders app container header", () => {
  const html = renderToString(React.createElement(App));
  assert.match(html, /Career Ops Dashboard/);
});
