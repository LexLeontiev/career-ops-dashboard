# Open-Source Release Readiness Design

**Date:** 2026-08-14
**Target release:** `career-ops-dashboard` v0.1.0
**License:** MIT, Copyright (c) 2026 Alexey Leontyev
**Public contact:** lexleontiev@gmail.com

## Purpose

Prepare the current working tree for its first contributor-ready public release without redesigning the product or adding features. The result must be safe to publish, understandable to new users, reproducible for contributors, and continuously verified on supported platforms.

The current uncommitted UI work is part of the release candidate and must be preserved. The project remains an unofficial, local-first companion to the canonical [`santifer/career-ops`](https://github.com/santifer/career-ops) project.

## Current Baseline

- The existing 10 tests pass.
- The production build succeeds but reports an oversized JavaScript chunk, and the bundled Material Symbols font is approximately 4 MB.
- The repository has no public license, contributor guide, security policy, code of conduct, support policy, GitHub templates, or CI workflow.
- The README contains a placeholder clone URL and points at a non-canonical upstream fork.
- Package metadata uses the internal name `career-ops-web`, version `1.0.0`, and lacks public repository metadata.
- `.agent/`, `.agents/`, `scratch/`, and internal Superpowers design/plan documents are not public product artifacts.
- A credential-like Google API key is present in the untracked `.agents/mcp_config.json`. The directory is not currently ignored. The key value must never be copied into documentation, commits, logs, or reports.
- The working tree contains substantial user-owned changes. Cleanup and release work must not overwrite or discard them.

## Release Contract

### Product identity

- Public repository and package name: `career-ops-dashboard`.
- First public release: `0.1.0`.
- License: MIT with `Alexey Leontyev` as the copyright holder.
- Documentation language: English only for v0.1.0.
- Public security and conduct contact: `lexleontiev@gmail.com`.
- README disclaimer: “Unofficial community UI — not affiliated with or endorsed by career-ops or its maintainers.”
- Written permission from the career-ops trademark owner is a hard publication gate because the product name contains `career-ops`. Compatibility may be described as “works with career-ops.”

### Supported environment

- User platforms: macOS and Linux. Windows is supported only through WSL and is not part of the v0.1.0 native support contract.
- Runtime versions: Node.js 22 LTS and Node.js 24 LTS.
- Node.js 18 and 20 are not supported because they are end-of-life as of the design date.
- The application binds to `127.0.0.1` by default. External network binding requires an explicit configuration override and a documented privacy warning.

### Upstream relationship

- The canonical compatibility target is `santifer/career-ops`, not the `Fighter90/career-ops` fork.
- `career-ops-dashboard` remains a companion checkout and reads the upstream data files and parser contract.
- The upstream parser is not copied, vendored, or forked into this repository.
- Compatibility expectations, expected directory layout, and actionable failure messages are documented.

## Public Repository Surface

The release adds or updates the following public artifacts:

- `README.md`: product purpose, synthetic-data screenshot, unofficial status, upstream compatibility, requirements, quick start, configuration, privacy model, commands, troubleshooting, contribution link, security link, and license.
- `LICENSE`: standard MIT text.
- `CONTRIBUTING.md`: supported setup, branch/PR workflow, quality commands, test expectations, commit guidance, scope boundaries, and reporting channels.
- `CODE_OF_CONDUCT.md`: Contributor Covenant with the approved conduct contact.
- `SECURITY.md`: supported release policy and confidential reporting via GitHub private vulnerability reporting or the approved email address.
- `SUPPORT.md`: questions versus bug reports versus security reports.
- `ARCHITECTURE.md`: client, server, upstream adapter, data flow, trust boundaries, and non-goals.
- `CHANGELOG.md`: initial `0.1.0` release entry.
- `.github/ISSUE_TEMPLATE/`: structured bug report and feature request forms with blank issues disabled.
- `.github/pull_request_template.md`: verification, screenshots where applicable, security/privacy, and documentation checklist.
- `.github/workflows/`: CI and dependency review workflows with minimum permissions.
- `.github/dependabot.yml`: weekly npm and GitHub Actions updates.
- `.editorconfig` and quality-tool configuration.
- `package.json`: `career-ops-dashboard`, `0.1.0`, MIT, repository/homepage/bugs/keywords/engines metadata, and quality scripts.

`private: true` remains in `package.json`. It prevents accidental npm publication and does not prevent the Git repository from being open source.

## Repository Hygiene

- Expand `.gitignore` to cover `.env` variants while allowing a safe `.env.example` if one is useful, build output, coverage, logs, editor files, `.agent/`, `.agents/`, `scratch/`, and Superpowers working files.
- Remove tracked `docs/superpowers/` files from the release tree.
- Do not rewrite Git history. The internal design documents are not secret, and preserving history is safer than rewriting a dirty, active branch.
- Do not commit generated build output, local fixtures containing personal job-search data, credentials, private paths, or tool configuration.
- The credential-like key in `.agents/mcp_config.json` must be revoked and replaced by the user before publication even though it is currently untracked.
- Perform secret scans against both the release tree and tracked history. A clean scan is a release gate.

## Runtime Architecture

The existing React/Vite/Express structure remains. The normalized data flow is:

```text
CAREER_OPS_ROOT
  -> validated upstream paths
  -> upstream parser adapter
  -> shared Application model
  -> Express JSON/report APIs
  -> React loading/filtering/sorting/report UI
```

### Shared application model

- Move the `Application` type out of `DataTable` into a shared module that does not depend on React.
- Make the parser return `Promise<Application[]>` rather than `any[]`.
- Normalize optional upstream fields at the adapter boundary.
- Validate that dynamically imported upstream parser functions exist before calling them.
- Use Node's file URL utilities instead of string-concatenating `file://` URLs.

### Path and server boundary

- Normalize and validate `CAREER_OPS_ROOT` without assuming the process is launched from an arbitrary directory.
- Validate report filenames and resolved containment using path-aware checks, not string-prefix assumptions.
- Keep report access read-only.
- Separate application construction from process startup so HTTP behavior can be tested without import-time port binding.
- Bind to loopback by default and document an explicit `HOST` override.
- Send appropriate content types and baseline security headers.

### Client boundary

- Type API responses and handle malformed/non-array payloads without crashing the UI.
- Cancel in-flight requests when components unmount.
- Keep user-facing messages actionable and avoid leaking unnecessary local paths.
- Preserve existing filtering, sorting, statistics, themes, privacy mode, and responsive behavior.

### Accessibility and performance

- Give the report drawer dialog semantics, focus entry/restoration, Escape handling, an accessible close label, and suitable loading/error announcements.
- Make sortable headers keyboard-operable and expose sort state.
- Label search and report controls independently of icon fonts.
- Replace or subset the full Material Symbols font so the release does not ship an approximately 4 MB font for a small icon set.
- Resolve the current JavaScript chunk warning with a targeted split or dependency-loading change, without redesigning the application.

## Error Handling

- Missing or invalid upstream roots produce actionable setup guidance.
- Missing parser exports and malformed tracker content produce stable API error responses.
- Invalid report names return a client error; absent reports return not found; file-read failures return a generic server error.
- Detailed errors may be logged locally, but API responses do not expose stack traces or credentials.
- UI loading, empty, and error states remain distinct and accessible.
- Startup scripts fail fast when Node, npm, or the upstream checkout is unavailable.

## Testing Strategy

Tests must be hermetic and must not read the maintainer's real career-ops data.

### Fixtures

- Create temporary career-ops roots containing synthetic `applications.md`, reports, and a minimal parser module that implements the expected upstream contract.
- Use temporary directories per test and clean them deterministically.
- Synthetic data used in tests and the README screenshot must contain no real companies, roles, notes, or personal paths.

### Coverage targets

- Configuration resolution: explicit root, default root behavior, missing files, and invalid roots.
- Parser adapter: valid rows, optional fields, malformed input, missing parser exports, and report link normalization.
- HTTP API: applications success/failure, valid report, missing report, invalid filename, and traversal attempts.
- Client behavior: filtering, status counts, sorting, score formatting, statistics, theme/privacy persistence, and malformed API responses.
- Drawer behavior: loading, errors, links, Escape, focus entry, and focus restoration.
- Scripts/build: environment checks and a production build/start smoke path.

## Quality Tooling and CI

Expose consistent local commands:

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run check` to run the complete non-mutating quality gate

GitHub Actions runs clean installation and quality checks on Ubuntu and macOS with Node.js 22 and 24. Workflows use read-only permissions unless a specific job requires more. Pull requests also receive dependency review. Dependabot checks npm packages and GitHub Actions weekly.

Repository settings documented for the maintainer include secret scanning, push protection, private vulnerability reporting, branch protection requiring CI, and automatic deletion of merged branches.

## Security and Dependency Review

- Review every direct runtime and development dependency for necessity, maintenance, advisories, and license compatibility.
- Run a production dependency audit and document any accepted exception with evidence and an expiry condition.
- Check dependency licenses against MIT distribution requirements.
- Do not add a network-facing feature, telemetry, authentication, cloud storage, or write access to upstream data in v0.1.0.
- Markdown rendering continues without raw HTML execution; external links retain safe target/rel behavior.

## Implementation Sequence

1. Record the exact baseline and protect local artifacts from accidental staging.
2. Add hermetic tests for current and required behavior.
3. Apply typed-boundary, path-safety, server-binding, accessibility, and performance fixes.
4. Add formatting, linting, typecheck, CI, dependency automation, and security checks.
5. Build the public documentation and community-health surface.
6. Remove internal documents from the release tree and perform a complete diff review.
7. Verify the release from a clean, synthetic-data environment.

Implementation follows test-driven development for behavior changes. Refactoring is limited to changes required for safety, clarity, testability, accessibility, or release reliability.

## Acceptance Criteria

The repository is ready for the maintainer's publication step only when all of the following are true:

- A clean `npm ci` succeeds on the supported Node versions.
- Format, lint, typecheck, tests, and production build pass without warnings.
- Tests run without the maintainer's adjacent career-ops checkout.
- The build no longer includes the full approximately 4 MB icon font and has no oversized-chunk warning.
- README installation and troubleshooting instructions are verified against the release tree.
- Public documentation, community files, package metadata, and `CHANGELOG.md` consistently use `career-ops-dashboard` and `0.1.0`.
- The canonical upstream is `santifer/career-ops` everywhere.
- The unofficial-project disclaimer is prominent.
- Secret scans find no credentials or private paths in the release tree or tracked history.
- The credential discovered in `.agents/mcp_config.json` has been revoked by the maintainer.
- Written trademark permission for the `career-ops-dashboard` name has been obtained.
- CI is green and required branch protections are configured.
- The final Git diff contains no accidental personal files or generated artifacts.

## Manual Publication Boundary

Implementation prepares the local repository but does not:

- revoke or rotate external credentials;
- request trademark permission;
- change repository visibility;
- push commits or tags;
- create a GitHub release;
- enable repository settings through the GitHub UI or API.

Those actions remain explicit maintainer responsibilities after the local readiness work is complete.

## Non-Goals

- Native Windows support outside WSL.
- npm package publication.
- A standalone copy of the career-ops parser or data model.
- New product features or a UI redesign.
- Cloud hosting, telemetry, authentication, or multi-user access.
- Rewriting Git history solely to remove non-secret internal design documents.
- Publishing, tagging, or changing remote repository settings without separate authorization.

## References

- [career-ops canonical repository](https://github.com/santifer/career-ops)
- [career-ops trademark policy](https://github.com/santifer/career-ops/blob/main/TRADEMARK.md)
- [GitHub repository best practices](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories)
- [GitHub community health files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [GitHub Node.js CI guidance](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)
