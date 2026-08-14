# Contributing

Thank you for contributing to career-ops-dashboard. By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

Use Node.js 22 or 24 and install the locked dependency set:

```bash
npm ci
```

Run the application against the included synthetic fixture when you need local data:

```bash
CAREER_OPS_ROOT="$(pwd)/test/fixtures/career-ops" npm run dev
```

## Data handling

Use synthetic fixtures only. Never commit resumes, application trackers, reports, `.env` files, API keys, credentials, or absolute personal paths. Do not attach real career data or secrets to issues, pull requests, comments, or screenshots.

## Workflow

1. Create a focused branch from `main`.
2. Make a narrowly scoped change with no unrelated feature additions.
3. Run the relevant tests and then the required complete check:

   ```bash
   npm run check
   ```

4. Open a pull request that explains the change, includes documentation and synthetic screenshots when applicable, and completes the pull-request template.

Use Conventional Commit messages, for example:

- `fix: make local startup reproducible`
- `test: catch caller-relative start paths`
- `ci: add release quality workflows`
- `docs: prepare contributor-ready public release`

## Upstream boundary

career-ops-dashboard is a read-only consumer of a local career-ops checkout. Do not add code that writes upstream tracker or report files, add telemetry, authentication, cloud sync, vendored upstream parser code, or unrelated product features. Keep changes compatible with the canonical [santifer/career-ops](https://github.com/santifer/career-ops) upstream where this project already integrates with it.
