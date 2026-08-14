// @vitest-environment jsdom
import { expect, test } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import App from "../src/client/App.js";

test("renders app container header", () => {
  const html = renderToString(React.createElement(App));
  expect(html).toMatch(/Career Ops/);
  expect(html).toMatch(/Privacy Off/);
  expect(html).toMatch(/Switch to light theme/);
  expect(html).toMatch(/dark_mode/);
});
