import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export interface CareerOpsFixture {
  root: string;
  cleanup(): Promise<void>;
}

const fixtureDirectory = fileURLToPath(new URL("../fixtures/career-ops", import.meta.url));

export async function createCareerOpsFixture(): Promise<CareerOpsFixture> {
  const root = await mkdtemp(join(tmpdir(), "career-ops-dashboard-"));
  await cp(fixtureDirectory, root, { recursive: true });

  return {
    root,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}
