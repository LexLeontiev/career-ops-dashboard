import { expect, test } from "vitest";
import { createReadmePreviewSettings } from "../scripts/readme-preview-settings.js";

test("keeps the existing dark README preview paths by default", () => {
  expect(createReadmePreviewSettings(undefined)).toEqual({
    theme: "dark",
    dashboardFilename: "dashboard-preview.png",
    timelineFilename: "timeline-preview.png",
  });
});

test("uses separate filenames for a light README preview", () => {
  expect(createReadmePreviewSettings("light")).toEqual({
    theme: "light",
    dashboardFilename: "dashboard-preview-light.png",
    timelineFilename: "timeline-preview-light.png",
  });
});
