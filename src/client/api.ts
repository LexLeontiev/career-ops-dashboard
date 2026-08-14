import { parseApplicationsPayload, type Application } from "../shared/application.js";

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export async function fetchApplications(
  signal: AbortSignal,
  request: FetchLike = fetch,
): Promise<Application[]> {
  const response = await request("/api/applications", { signal });
  if (!response.ok) throw new Error(`Failed to load applications (HTTP ${response.status})`);
  return parseApplicationsPayload(await response.json());
}
