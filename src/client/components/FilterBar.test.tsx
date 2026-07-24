import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { FilterBar } from "./FilterBar.js";

test("renders status select dropdown for mobile screens with correct counts", () => {
  const counts = {
    all: 10,
    active: 4,
    evaluated: 2,
    applied: 2,
    interview: 2,
    skip: 1,
    rejected: 2,
    discarded: 1,
  };
  const html = renderToString(
    React.createElement(FilterBar, {
      searchQuery: "",
      setSearchQuery: () => {},
      statusFilter: "active",
      setStatusFilter: () => {},
      counts,
    })
  );

  assert.match(html, /<select/);
  assert.match(html, /id="status-select"/);
  assert.match(html, /Active \(4\)/);
  assert.match(html, /All Statuses \(10\)/);
});
