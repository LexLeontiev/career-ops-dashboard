export type ReadmePreviewTheme = "light" | "dark";

export function createReadmePreviewSettings(requestedTheme: string | undefined): {
  theme: ReadmePreviewTheme;
  dashboardFilename: string;
  timelineFilename: string;
} {
  const theme = requestedTheme === "light" ? "light" : "dark";
  const suffix = theme === "light" ? "-light" : "";

  return {
    theme,
    dashboardFilename: `dashboard-preview${suffix}.png`,
    timelineFilename: `timeline-preview${suffix}.png`,
  };
}
