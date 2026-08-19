import { parseApplicationsPayload, type Application } from "../shared/application.js";

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class TrackerNotInitializedError extends Error {
  override readonly name = "TrackerNotInitializedError";
}

export async function fetchApplications(
  signal: AbortSignal,
  request: FetchLike = fetch,
): Promise<Application[]> {
  const response = await request("/api/applications", { signal });
  if (response.status === 404) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      // A malformed error response is handled as a generic HTTP failure below.
    }
    if (
      typeof payload === "object" &&
      payload !== null &&
      "code" in payload &&
      payload.code === "TRACKER_NOT_INITIALIZED"
    ) {
      throw new TrackerNotInitializedError("Tracker not initialized");
    }
  }
  if (!response.ok) throw new Error(`Failed to load applications (HTTP ${response.status})`);
  return parseApplicationsPayload(await response.json());
}
