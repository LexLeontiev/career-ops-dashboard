# Releasing

Complete these manual gates in order before a public release:

- [ ] Revoke and replace the credential previously stored in `.agents/mcp_config.json`.
- [ ] Obtain written permission to publish under the `career-ops-dashboard` name.
- [ ] Confirm `npm run check` and both npm audits pass.
- [ ] Confirm the GitHub Actions matrix is green.
- [ ] Run a runtime smoke test against a fresh canonical `santifer/career-ops` checkout in a disposable external environment.
- [ ] Enable secret scanning and push protection.
- [ ] Enable private vulnerability reporting.
- [ ] Protect `main` and require the CI quality job.
- [ ] Enable automatic deletion of merged branches.
- [ ] Review the public repository preview before changing visibility.
- [ ] Create v0.1.0 only after every preceding item is complete.
